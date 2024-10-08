import { Cache } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { Model } from 'mongoose';

import { PaginationWithFilterDto } from '../../utilities/classes';
import { aggregationPipeline } from '../../utilities/helper';
import { UserDocument } from '../users/entities/user.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';

@Injectable()
export class MovieService {
  TMDB_API_KEY: string;
  private readonly logger = new Logger(MovieService.name);

  constructor(
    @InjectModel('Movie') private readonly movieModel: Model<Movie>,
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
  ) {
    this.TMDB_API_KEY = process.env.TMDB_API_KEY;
  }

  async onModuleInit() {
    console.log('onModuleInit');
    await this.fetchAndStoreMovies();
  }

  async fetchGenres(): Promise<{ [key: number]: string }> {
    try {
      const cacheKey = 'genres';
      let genreMap = await this.cacheManager.get<{ [key: number]: string }>(
        cacheKey,
      );

      if (!genreMap) {
        const response = await axios.get(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=${this.TMDB_API_KEY}`,
        );
        const genres = response?.data?.genres;
        genreMap = {};
        genres?.forEach((genre) => {
          genreMap[genre.id] = genre.name;
        });
        await this.cacheManager.set(cacheKey, genreMap, 86400); // Cache  for 1 day
        this.logger.debug('Genres cached');
      } else {
        this.logger.debug('Genres retrieved from cache');
      }

      return genreMap;
    } catch (error) {
      this.logger.error(error);
    }
  }

  // this method will be run at 3 AM Egypt time
  @Cron('0 3 * * *', {
    timeZone: 'Africa/Cairo',
  })
  async fetchAndStoreMovies() {
    const genreMap = await this.fetchGenres();
    let page = 1;
    const totalPages = 100;

    while (page <= totalPages) {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/popular?api_key=${this.TMDB_API_KEY}&page=${page}`,
        );

        const movies = response?.data?.results;
        // totalPages = response?.data?.total_pages;

        for (const movie of movies) {
          const existingMovie = await this.movieModel.findOne({
            tmdbId: movie.id,
          });
          if (!existingMovie) {
            await this.movieModel.create({
              tmdbId: movie.id,
              title: movie.title,
              overview: movie.overview,
              releaseDate: movie.release_date,
              genres: movie.genre_ids.map((id) => genreMap[id]), // Convert genre IDs to names
              averageRating: movie.vote_average,
              type: 'popular',
              tmdbRating: movie.vote_average,
            });
            // await movieDocument.save();
            // this.logger.log(`Movie "${movie.title}" added to the database. `);
          } else {
            // this.logger.log(
            //   `Movie "${movie.title}" already exists in the database.`,
            // );
          }
        }
      } catch (error) {
        this.logger.error(error);
      }
      page++;
    }

    this.logger.verbose('Movies successfully stored in MongoDB database.');
  }

  async rateMovie(_id: string, rating: number): Promise<{ message: string }> {
    if (rating < 0 || rating > 10) {
      throw new BadRequestException('Rating must be between 0 and 10');
    }

    const movie = await this.movieModel.findOne({ _id });

    if (!movie) {
      throw new BadRequestException('Movie not found');
    }

    movie.userRatings.push(rating);
    const totalRatings = movie.userRatings.length;
    const userRatingSum = movie.userRatings.reduce((acc, val) => acc + val, 0);
    movie.averageRating =
      (userRatingSum + movie.tmdbRating) / (totalRatings + 1);

    await movie.save();

    return {
      message: 'Rating added successfully',
    };
  }

  async create(createMovieDto: CreateMovieDto) {
    await this.invalidateListCaches();
    return this.movieModel.create(createMovieDto);
  }

  async findAll(
    {
      searchField,
      searchText,
      page,
      limit,
      sort,
      genre,
    }: PaginationWithFilterDto,
    user: UserDocument,
  ): Promise<any> {
    const cacheKey = `movies_all_${page}_${limit}_${sort}_${genre}_${searchField}_${searchText}`;
    const cachedMovies = await this.cacheManager.get<any>(cacheKey);

    if (cachedMovies) {
      this.logger.debug('cachedMovies for all movies retrieved from cache');
      cachedMovies.data = cachedMovies.data.map((movie) => ({
        ...movie,
        isFavorite: user.favoriteMovies.includes(movie._id.toString()),
      }));
      return cachedMovies;
    }

    if (!sort) {
      sort = '-releaseDate';
    }
    const search = { field: searchField, text: searchText };
    let match: any = {
      removed: false,
    };
    if (genre) {
      match = {
        ...match,
        genres: { $in: [genre] },
      };
    }

    const data = await this.movieModel.aggregate([
      {
        $match: match,
      },
      {
        $addFields: {
          averageRating: { $ifNull: ['$averageRating', 0] },
        },
      },
      {
        $project: {
          userRatings: 0,
          tmdbRating: 0,
          removed: 0,
          __v: 0,
          createdAt: 0,
          updatedAt: 0,
        },
      },
      ...aggregationPipeline(search, sort),
      {
        $facet: {
          data: [{ $skip: (page - 1) * limit || 0 }, { $limit: +limit || 10 }],
          metadata: [{ $count: 'total' }],
        },
      },
    ]);

    const result = {
      data: data[0].data,
      total: data[0].metadata[0]?.total || 0,
    };

    // Cache the result without user-specific fields
    await this.cacheManager.set(cacheKey, result, 3600000); // Cache for 1 hour

    // Add user-specific fields before returning
    result.data = result.data.map((movie) => ({
      ...movie,
      isFavorite: user.favoriteMovies.includes(movie._id.toString()),
    }));

    return result;
  }

  // async findOne(id: string) {
  //   const movie = await this.movieModel.findById(id);
  //   if (!movie) throw new BadRequestException('Movie Not Found');
  //   return movie;
  // }
  async findOne(id: string) {
    const cacheKey = `movie_${id}`;
    const cachedMovie = await this.cacheManager.get<Movie>(cacheKey);

    if (cachedMovie) {
      return cachedMovie;
    }

    const movie = await this.movieModel.findById(id);
    if (!movie) throw new BadRequestException('Movie Not Found');

    await this.cacheManager.set(cacheKey, movie, 3600000); // Cache for 10 minutes

    return movie;
  }

  async update(id: string, updateMovieDto: UpdateMovieDto) {
    const movie = await this.movieModel.findByIdAndUpdate(id, updateMovieDto, {
      new: true,
    });
    if (!movie) throw new BadRequestException('Movie Not Found');
    await this.cacheManager.del(`movie_${id}`);
    await this.invalidateListCaches();
    return {
      message: 'Movie updated successfully',
    };
  }

  async remove(id: string) {
    const movie = await this.movieModel.findByIdAndUpdate(id, {
      removed: true,
    });
    if (!movie) throw new BadRequestException('Movie Not Found');
    await this.cacheManager.del(`movie_${id}`);
    await this.invalidateListCaches();
    return {
      message: 'Movie removed successfully',
    };
  }

  private async invalidateListCaches() {
    const cacheManagerStore = this.cacheManager.store;
    if (typeof cacheManagerStore.keys === 'function') {
      const keys = await cacheManagerStore.keys();
      const listCacheKeys = keys.filter((key) => key.startsWith('movies_all_'));
      for (const key of listCacheKeys) {
        await this.cacheManager.del(key);
      }
      this.logger.debug('Invalidated list caches');
    } else {
      this.logger.warn('Cache store does not support key listing');
    }
  }
}
