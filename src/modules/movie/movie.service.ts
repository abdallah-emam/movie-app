import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import mongoose, { Model } from 'mongoose';
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

  constructor(@InjectModel('Movie') private readonly movieModel: Model<Movie>) {
    this.TMDB_API_KEY = process.env.TMDB_API_KEY;
    // this.fetchGenres();
  }

  private async fetchGenres(): Promise<{ [key: number]: string }> {
    const response = await axios.get(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${this.TMDB_API_KEY}`,
    );
    const genres = response.data.genres;
    const genreMap: { [key: number]: string } = {};
    genres.forEach((genre) => {
      genreMap[genre.id] = genre.name;
    });
    console.log('🚀 ~ MovieService ~ fetchGenres ~ genreMap:', genreMap);
    return genreMap;
  }

  // this method will be run at 3 AM Egypt time
  @Cron('0 3 * * *', {
    timeZone: 'Africa/Cairo',
  })
  async fetchAndStoreMovies() {
    const genreMap = await this.fetchGenres();
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/popular?api_key=${this.TMDB_API_KEY}&page=${page}`,
      );
      const movies = response.data.results;
      totalPages = response.data.total_pages;

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
      page++;
    }

    this.logger.verbose('Movies successfully stored in MongoDB database.');
  }

  async rateMovie(_id: string, rating: number): Promise<Movie> {
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

    return movie;
  }

  create(createMovieDto: CreateMovieDto) {
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
          isFavorite: {
            $in: [
              '$_id',
              user.favoriteMovies.map((id) => new mongoose.Types.ObjectId(id)),
            ],
          },
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
    return {
      data: data[0].data,
      total: data[0].metadata[0]?.total || 0,
    };
  }

  async findOne(id: string) {
    const movie = await this.movieModel.findById(id);
    if (!movie) throw new BadRequestException('Movie Not Found');
    return movie;
  }

  async update(id: string, updateMovieDto: UpdateMovieDto) {
    const movie = await this.movieModel.findByIdAndUpdate(id, updateMovieDto);
    if (!movie) throw new BadRequestException('Movie Not Found');
    return {
      message: 'Movie updated successfully',
    };
  }

  async remove(id: string) {
    const movie = await this.movieModel.findByIdAndUpdate(id, {
      removed: true,
    });
    if (!movie) throw new BadRequestException('Movie Not Found');
    return {
      message: 'Movie removed successfully',
    };
  }
}
