import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { User } from './entities/user.entity';
import { Role } from './enum/role.enum';
import { PayloadInterface } from './interfaces/payload.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  assignToken(payload: PayloadInterface) {
    return this.jwtService.sign(payload, {
      expiresIn: '5d',
    });
  }

  async register(registerDto: RegisterDto) {
    const existUsername = await this.userModel.findOne({
      username: registerDto.username,
      removed: false,
      role: Role.USER,
    });
    if (existUsername) throw new BadRequestException('Username Already Exist');

    if (registerDto.password.localeCompare(registerDto.confirmPassword) !== 0)
      throw new BadRequestException('Password Not Match');

    let createUser = await this.userModel.create(registerDto);
    createUser = createUser.toObject();

    const token = await this.assignToken({
      _id: createUser._id,
      username: createUser.username,
      role: createUser.role,
    });

    return {
      message: 'User Created Successfully',
      data: {
        ...createUser,
        token,
      },
    };
  }
  async login(loginDto: LoginDto) {
    const user = await this.userModel.findOne({
      username: loginDto.username,
      removed: false,
      role: Role.USER,
    });
    if (!user) throw new UnauthorizedException('Invalid Email or password');

    const checkPassword = await user.passwordCheck(loginDto.password);
    if (!checkPassword)
      throw new UnauthorizedException('Invalid Email or password');

    const token = await this.assignToken({
      _id: user._id,
      username: user.username,
      role: user.role,
    });

    return {
      message: 'User Logged In Successfully',
      data: {
        ...user.toObject(),
        token,
      },
    };
  }

  // findAll() {
  //   return `This action returns all users`;
  // }

  findOneById(id: string) {
    return this.userModel.findById(id);
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
