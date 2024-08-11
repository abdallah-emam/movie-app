import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Model } from 'mongoose';
import { PaginationDto } from 'src/utilities/classes';
import { aggregationPipeline } from 'src/utilities/helper';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';

@Injectable()
export class MovieService {
  TMDB_API_KEY: string;

  private readonly logger = new Logger(MovieService.name);
  constructor(@InjectModel('Movie') private readonly movieModel: Model<Movie>) {
    this.TMDB_API_KEY = process.env.TMDB_API_KEY;
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
    return genreMap;
  }

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
          const movieDocument = new this.movieModel({
            tmdbId: movie.id,
            title: movie.title,
            overview: movie.overview,
            releaseDate: movie.release_date,
            genres: movie.genre_ids.map((id) => genreMap[id]), // Convert genre IDs to names
            rating: movie.vote_average,
            type: 'popular',
          });
          await movieDocument.save();
          // this.logger.log(`Movie "${movie.title}" added to the database. `);
        } else {
          // this.logger.log(
          //   `Movie "${movie.title}" already exists in the database.`,
          // );
        }
      }
      page++;
    }

    this.logger.log('Movies successfully stored in MongoDB database.');
  }

  create(createMovieDto: CreateMovieDto) {
    return this.movieModel.create(createMovieDto);
  }

  async findAll({ searchField, searchText, page, limit, sort }: PaginationDto) {
    const search = { field: searchField, text: searchText };

    const data = await this.movieModel.aggregate([
      {
        $match: {
          removed: false,
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

  findOne(id: string) {
    const movie = this.movieModel.findById(id);
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

  remove(id: string) {
    const movie = this.movieModel.findByIdAndUpdate(id, { removed: true });
    if (!movie) throw new BadRequestException('Movie Not Found');
    return {
      message: 'Movie removed successfully',
    };
  }
}
