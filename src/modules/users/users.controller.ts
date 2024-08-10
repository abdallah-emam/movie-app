import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator';
import { Serialize } from '../../common/interceptors/serialize.interceptor';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { UserResponseDto } from './dto/response.dto';
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
    return this.usersService.login(loginDto);
  }

  @Post('register')
  @Serialize(UserResponseDto)
  @Public()
  @ApiOperation({ summary: 'Employee Register' })
  register(@Body() registerDto: RegisterDto) {
    return this.usersService.register(registerDto);
  }

  // @Get()
  // @Roles(Role.ADMIN)
  // findAll() {
  //   return this.usersService.findAll();
  // }

  // @Get(':id')
  // @Roles(Role.ADMIN)
  // findOne(@Param('id') id: string) {
  //   return this.usersService.findOneById(id);
  // }

  // @Patch(':id')
  // @Roles(Role.ADMIN)
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // @Roles(Role.ADMIN)
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}
