import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    type: String,
    description: 'User name',
    required: true,
  })
  @IsString()
  name: string;

  // username
  @ApiProperty({
    type: String,
    description: 'User name',
    required: true,
    example: 'abdallah',
    uniqueItems: true,
  })
  @IsString()
  username: string;

  // password
  @ApiProperty({
    type: String,
    description: 'User password',
    example: 'abdallah123',
    required: true,
  })
  @IsString()
  password: string;

  @ApiProperty({
    type: String,
    description: 'Confirm password',
    example: 'abdallah123',
    required: true,
  })
  @IsString()
  confirmPassword: string;
}

export class LoginDto {
  @ApiProperty({
    type: String,
    description: 'User name',
    example: 'abdallah',
    required: true,
  })
  @IsString()
  username: string;

  @ApiProperty({
    type: String,
    description: 'User password',
    example: 'abdallah123',
    required: true,
  })
  @IsString()
  password: string;
}
