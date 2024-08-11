import { Test, TestingModule } from '@nestjs/testing';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { UserResponseDto, UserSerializerDto } from './dto/response.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  let data = new UserSerializerDto();
  data = {
    _id: '1',
    createdAt: new Date(),
    username: 'johndoe',
    name: 'John Doe',
    password: 'password',
    role: 'user',
    token: 'token',
    removed: false,
    favoriteMovies: [],
  };
  let mockUserResponseDto = new UserResponseDto();

  const mockUsersService = {
    login: jest.fn(),
    register: jest.fn().mockResolvedValue(mockUserResponseDto),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should sign in a user', async () => {
    // Arrange
    let body = new LoginDto();
    body = { username: 'johndoe', password: 'password' };
    mockUserResponseDto = {
      data: data,
      message: 'User Logged In Successfully',
    };
    mockUsersService.login.mockResolvedValue(mockUserResponseDto);

    // Act
    const result = await controller.login(body as LoginDto);

    // Assert
    expect(result).toEqual(mockUserResponseDto);
  });

  it('should register a user', async () => {
    // Arrange
    let body = new RegisterDto();
    body = {
      username: 'johndoe',
      name: 'John Doe',
      password: 'password',
      confirmPassword: 'password',
    };
    mockUserResponseDto = {
      data: data,
      message: 'User Registered Successfully',
    };
    mockUsersService.register.mockResolvedValue(mockUserResponseDto);

    // Act
    const result = await controller.register(body as RegisterDto);

    // Assert
    expect(result).toEqual(mockUserResponseDto);
  });
});
