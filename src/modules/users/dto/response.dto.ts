import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
export class UserDto {
  @Transform((value) => {
    return value.obj._id?.toString();
  })
  @Expose()
  _id: string;

  @IsOptional()
  @Expose()
  username: string;

  @IsOptional()
  @Expose()
  name: string;

  @IsOptional()
  @Exclude()
  role: string;

  @IsOptional()
  @IsString()
  @Exclude()
  password: string;

  @IsOptional()
  @Exclude()
  removed: boolean;

  @IsOptional()
  @IsString()
  @Expose()
  token: string;

  @IsOptional()
  @Expose()
  createdAt: Date;
}

export class UserResponseDto {
  @Type(() => UserDto)
  @Expose()
  data: UserDto;

  @Expose()
  message: string;
}
