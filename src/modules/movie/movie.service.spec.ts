import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { Model } from 'mongoose';
import { PaginationWithFilterDto } from '../../utilities/classes';
import { UserDocument } from '../users/entities/user.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';
import { MovieService } from './movie.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('MovieService', () => {
  let service: MovieService;
  let movieModel: Model<Movie>;

  const mockMovieModel = {
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findOne: jest.fn(),
    aggregate: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: getModelToken('Movie'),
          useValue: mockMovieModel,
        },
      ],
    }).compile();

    service = module.get<MovieService>(MovieService);
    movieModel = module.get<Model<Movie>>(getModelToken('Movie'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a movie', async () => {
      const createMovieDto: CreateMovieDto = {
        title: 'Inception',
        image: 'inception.jpg',
        overview: 'A mind-bending thriller',
        releaseDate: new Date('2010-07-16'),
        genres: ['Action', 'Sci-Fi'],
      };
      mockMovieModel.create.mockResolvedValue(createMovieDto);

      const result = await service.create(createMovieDto);
      expect(result).toEqual(createMovieDto);
      expect(mockMovieModel.create).toHaveBeenCalledWith(createMovieDto);
    });
  });

  describe('findAll', () => {
    it('should return all movies with pagination and filters', async () => {
      const user = { favoriteMovies: [] } as UserDocument;
      const paginationWithFilterDto: PaginationWithFilterDto = {
        searchField: '',
        searchText: '',
        page: 1,
        limit: 10,
        sort: '-releaseDate',
        genre: ['Action'],
      };

      const expectedResult = {
        data: [],
        total: 0,
      };

      mockMovieModel.aggregate.mockResolvedValue([
        { data: [], metadata: [{ total: 0 }] },
      ]);

      const result = await service.findAll(paginationWithFilterDto, user);
      expect(result).toEqual(expectedResult);
      expect(mockMovieModel.aggregate).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a movie by ID', async () => {
      const movieId = 'someId';
      const expectedMovie = { title: 'Inception' };

      mockMovieModel.findById.mockResolvedValue(expectedMovie);

      const result = await service.findOne(movieId);
      expect(result).toEqual(expectedMovie);
      expect(mockMovieModel.findById).toHaveBeenCalledWith(movieId);
    });

    it('should throw BadRequestException if movie not found', async () => {
      const movieId = 'someId';

      mockMovieModel.findById.mockResolvedValue(null);

      await expect(service.findOne(movieId)).rejects.toThrow(
        new BadRequestException('Movie Not Found'),
      );
    });
  });

  describe('update', () => {
    it('should update a movie', async () => {
      const movieId = 'someId';
      const updateMovieDto: UpdateMovieDto = { title: 'Updated Title' };

      mockMovieModel.findByIdAndUpdate.mockResolvedValue(updateMovieDto);

      const result = await service.update(movieId, updateMovieDto);
      expect(result).toEqual({ message: 'Movie updated successfully' });
      expect(mockMovieModel.findByIdAndUpdate).toHaveBeenCalledWith(
        movieId,
        updateMovieDto,
      );
    });

    it('should throw BadRequestException if movie not found', async () => {
      const movieId = 'someId';
      const updateMovieDto: UpdateMovieDto = { title: 'Updated Title' };

      mockMovieModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(service.update(movieId, updateMovieDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a movie', async () => {
      const movieId = 'someId';

      mockMovieModel.findByIdAndUpdate.mockResolvedValue({});

      const result = await service.remove(movieId);
      expect(result).toEqual({ message: 'Movie removed successfully' });
      expect(mockMovieModel.findByIdAndUpdate).toHaveBeenCalledWith(movieId, {
        removed: true,
      });
    });

    it('should throw BadRequestException if movie not found', async () => {
      const movieId = 'someId';

      mockMovieModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(service.remove(movieId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('rateMovie', () => {
    it('should throw BadRequestException if rating is out of bounds', async () => {
      const movieId = 'someId';
      const rating = 11;

      await expect(service.rateMovie(movieId, rating)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if movie not found', async () => {
      const movieId = 'someId';
      const rating = 5;

      mockMovieModel.findOne.mockResolvedValue(null);

      await expect(service.rateMovie(movieId, rating)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should rate a movie', async () => {
      const movieId = 'someId';
      const rating = 5;
      const movie = {
        userRatings: [],
        tmdbRating: 7,
        averageRating: 0,
        save: jest.fn().mockResolvedValue(true),
      };

      mockMovieModel.findOne.mockResolvedValue(movie);

      const result = await service.rateMovie(movieId, rating);

      expect(result).toEqual(movie);
      expect(movie.userRatings).toContain(rating);
      expect(movie.averageRating).toBe(6);
      expect(movie.save).toHaveBeenCalled();
    });
  });

  describe('fetchGenres', () => {
    it('should fetch genres from TMDB', async () => {
      //arrange
      const genres = [
        { id: 1, name: 'Action' },
        { id: 2, name: 'Comedy' },
      ];
      mockedAxios.get.mockResolvedValue({ data: { genres } });
      //act
      const result = await service['fetchGenres']();
      //assert
      expect(result).toEqual({ 1: 'Action', 2: 'Comedy' });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${service.TMDB_API_KEY}`,
      );
    });
  });

  describe('fetchAndStoreMovies', () => {
    it('should fetch and store movies from TMDB to MongoDB', async () => {
      // Arrange
      const genres = { 1: 'Action', 2: 'Comedy' };
      const movies = [
        { id: 1, title: 'Movie 1', genre_ids: [1, 2], vote_average: 7.5 },
      ];
      service['fetchGenres'] = jest.fn().mockResolvedValue(genres);
      mockedAxios.get.mockResolvedValue({
        data: { results: movies, total_pages: 1 },
      });
      mockMovieModel.findOne.mockResolvedValue(null);

      // Act
      const spy = jest.spyOn(service, 'fetchAndStoreMovies');
      await service.fetchAndStoreMovies();

      expect(spy).toHaveBeenCalled();
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockMovieModel.create).toHaveBeenCalledTimes(1);
    });
    it('should fetch movies from TMDB and ignore existing ones', async () => {
      // Arrange
      const genres = { 1: 'Action', 2: 'Comedy' };
      const movies = [
        { id: 1, title: 'Movie 1', genre_ids: [1, 2], vote_average: 7.5 },
      ];
      service['fetchGenres'] = jest.fn().mockResolvedValue(genres);
      mockedAxios.get.mockResolvedValue({
        data: { results: movies, total_pages: 1 },
      });

      // Act
      const spy = jest.spyOn(service, 'fetchAndStoreMovies');
      await service.fetchAndStoreMovies();

      // Assert
      expect(spy).toHaveBeenCalled();
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });
});
