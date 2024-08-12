import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { User, UserDocument } from './entities/user.entity';
import { Role } from './enum/role.enum';
import { PayloadInterface } from './interfaces/payload.interface';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: Model<UserDocument>;

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    passwordCheck: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assignToken', () => {
    it('should generate a token using jwtService', () => {
      // Arrange
      const payload: PayloadInterface = {
        username: 'abdallah',
        role: Role.USER,
        _id: 'someId',
      };
      mockJwtService.sign.mockReturnValue('token');
      // Act
      const result = service.assignToken(payload);

      // Assert
      expect(result).toBe('token');
      expect(mockJwtService.sign).toHaveBeenCalledWith(payload, {
        expiresIn: '5d',
      });
    });
  });

  describe('Login', () => {
    it('should throw UnauthorizedException if auth not found', async () => {
      // Arrange
      let body = new LoginDto();
      body = { username: 'abdallah', password: 'abdallah123' };

      mockUserModel.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(body)).rejects.toThrow(UnauthorizedException);
    });
    it('should throw UnauthorizedException if password not match', async () => {
      // Arrange
      let body = new LoginDto();
      body = { username: 'abdallah', password: 'abdallah123' };

      mockUserModel.findOne.mockResolvedValue({
        username: 'abdallah',
        password: 'abdallah123',
        role: Role.USER,
        passwordCheck: jest.fn().mockResolvedValue(false),
      });

      // Act & Assert
      await expect(service.login(body)).rejects.toThrow(UnauthorizedException);
    });
    it('should successfully login', async () => {
      // Arrange
      let body = new LoginDto();
      body = { username: 'abdallah', password: 'abdallah123' };
      const dataFromDb = {
        username: 'abdallah',
        password: 'abdallah123',
        role: Role.USER,
        passwordCheck: jest.fn().mockResolvedValue(true),
        toObject() {
          return { ...this }; // Or perform any necessary transformations
        },
      };

      mockUserModel.findOne.mockResolvedValue(dataFromDb);
      mockJwtService.sign.mockReturnValue('token');

      // Act
      const result = await service.login(body);

      // Assert
      expect(result).toEqual({
        message: 'User Logged In Successfully',
        data: {
          ...dataFromDb.toObject(),
          token: 'token',
        },
      });
    });
  });

  describe('register', () => {
    it('should throw BadRequestException if username already exist', async () => {
      // Arrange
      let body = new RegisterDto();
      body = {
        username: 'abdallah',
        name: 'abdallah',
        password: 'abdallah123',
        confirmPassword: 'abdallah123',
      };
      mockUserModel.findOne.mockResolvedValue({
        username: 'abdallah',
        password: 'abdallah123',
        role: Role.USER,
      });
      // Act & Assert
      await expect(service.register(body)).rejects.toThrow(BadRequestException);
    });
    it('should throw BadRequestException if passwords do not match', async () => {
      let registerDto = new RegisterDto();
      registerDto = {
        username: 'abdallah',
        name: 'abdallah',
        password: 'abdallah123',
        confirmPassword: 'abdallah1234',
      };
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'Password Not Match',
      );
    });

    it('should successfully register', async () => {
      // Arrange
      let body = new RegisterDto();
      body = {
        username: 'abdallah',
        name: 'abdallah',
        password: 'abdallah123',
        confirmPassword: 'abdallah123',
      };

      mockUserModel.findOne.mockResolvedValue(null);
      mockJwtService.sign.mockReturnValue('token');
      const dataFromDb = {
        username: 'abdallah',
        password: 'abdallah123',
        role: Role.USER,
        passwordCheck: jest.fn().mockResolvedValue(true),
        toObject() {
          return { ...this }; // Or perform any necessary transformations
        },
      };
      mockUserModel.create.mockResolvedValue(dataFromDb);

      // Act
      const result = await service.register(body);

      // Assert
      expect(result).toEqual({
        message: 'User Created Successfully',
        data: {
          ...dataFromDb.toObject(),
          token: 'token',
        },
      });
    });
  });

  describe('findOneById', () => {
    it('should return user', async () => {
      // Arrange
      const id = 'someId';
      mockUserModel.findById.mockResolvedValue({
        username: 'abdallah',
        password: 'abdallah123',
        role: Role.USER,
      });
      // Act
      const result = await service.findOneById(id);
      // Assert
      expect(result).toEqual({
        username: 'abdallah',
        password: 'abdallah123',
        role: Role.USER,
      });
    });
  });

  describe('toggleFavorite', () => {
    it('should add the movie to favorites if not already present', async () => {
      // Arrange
      const user = {
        _id: 'userId',
        favoriteMovies: [],
        save: jest.fn().mockResolvedValue(true),
      } as any as UserDocument;
      const movieId = 'movieId';

      // Act
      const result = await service.toggleFavorite(user, movieId);

      // Assert
      expect(user.favoriteMovies).toContain(movieId);
      expect(user.save).toHaveBeenCalled();
      expect(result).toBe(user);
    });

    it('should remove the movie from favorites if already present', async () => {
      // Arrange
      const user = {
        _id: 'userId',
        favoriteMovies: ['movieId'],
        save: jest.fn().mockResolvedValue(true),
      } as any as UserDocument;
      const movieId = 'movieId';

      // Act
      const result = await service.toggleFavorite(user, movieId);

      // Assert
      expect(user.favoriteMovies).not.toContain(movieId);
      expect(user.save).toHaveBeenCalled();
      expect(result).toBe(user);
    });
  });
});
