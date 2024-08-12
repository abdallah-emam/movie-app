import { Test, TestingModule } from '@nestjs/testing';
import { UserDocument } from 'src/modules/users/entities/user.entity';
import { PaginationWithFilterDto } from 'src/utilities/classes';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieDocument } from './entities/movie.entity';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';

describe('MovieController', () => {
  let controller: MovieController;
  let service: MovieService;

  const mockMovieDBResponse: Partial<MovieDocument> = {
    _id: '1',
    tmdbId: 1,
    title: 'The Matrix',
    overview: 'The Matrix is a computer game',
    releaseDate: new Date('2020-01-01'),
    posterPath: 'matrix.jpg',
    image: 'matrix.jpg',
    genres: ['Action', 'Sci-Fi'],
    userRatings: [],
    averageRating: 0,
    tmdbRating: 0,
  };
  const mockMovieService = {
    create: jest.fn().mockResolvedValue(mockMovieDBResponse),
    findAll: jest.fn().mockResolvedValue([mockMovieDBResponse]),
    findOne: jest.fn().mockResolvedValue(mockMovieDBResponse),
    update: jest.fn(),
    remove: jest.fn(),
    rateMovie: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieController],
      providers: [{ provide: MovieService, useValue: mockMovieService }],
    }).compile();

    controller = module.get<MovieController>(MovieController);
    service = module.get<MovieService>(MovieService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a movie', async () => {
    // Arrange
    let query = new CreateMovieDto();
    query = {
      title: 'The Matrix',
      overview: 'The Matrix is a computer game',
      releaseDate: new Date('2020-01-01'),
      image: 'matrix.jpg',
      genres: ['Action', 'Sci-Fi'],
    };

    // Act
    const result = await controller.create(query);

    // Assert
    expect(result).toEqual(mockMovieDBResponse);
  });

  it('should get all movies', async () => {
    // Arrange
    const query = {} as PaginationWithFilterDto;
    const user = {} as UserDocument;

    // Act
    const result = await controller.findAll(user, query);
    // Assert
    expect(result).toEqual([mockMovieDBResponse]);
  });

  it('should get movie by id', async () => {
    // Arrange
    const id = '1';
    // Act
    const result = await controller.findOne(id);
    // Assert
    expect(result).toEqual(mockMovieDBResponse);
  });

  it('should update movie', async () => {
    // Arrange
    const id = '1';
    const updateMovieDto = {} as UpdateMovieDto;
    mockMovieService.update.mockResolvedValue({
      message: 'Movie updated successfully',
    });
    // Act
    const result = await controller.update(id, updateMovieDto);
    // Assert
    expect(result).toEqual({
      message: 'Movie updated successfully',
    });
  });

  it('should delete movie', async () => {
    // Arrange
    const id = '1';
    mockMovieService.remove.mockResolvedValue({
      message: 'Movie deleted successfully',
    });
    // Act
    const result = await controller.remove(id);
    // Assert
    expect(result).toEqual({
      message: 'Movie deleted successfully',
    });
  });

  it('should rate movie', async () => {
    // Arrange
    const id = '1';
    const body = {
      rating: 5,
    };
    mockMovieService.rateMovie.mockResolvedValue({
      message: 'Rating added successfully',
    });
    // Act
    const result = await controller.rateMovie(id, body);
    // Assert
    expect(result).toEqual({
      message: 'Rating added successfully',
    });
  });
});
