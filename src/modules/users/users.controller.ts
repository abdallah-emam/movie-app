import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorators';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { UserResponseDto } from './dto/response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './enum/role.enum';
import { UsersService } from './users.service';

@Controller('users')
@ApiBearerAuth()
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  @Public()
  @Serialize(UserResponseDto)
  @ApiOperation({ summary: 'Employee Login' })
  login(@Body() loginDto: LoginDto) {
    return this.usersService.Login(loginDto);
  }

  @Post('register')
  @Serialize(UserResponseDto)
  @Public()
  @ApiOperation({ summary: 'Employee Register' })
  register(@Body() registerDto: RegisterDto) {
    return this.usersService.SignUp(registerDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
