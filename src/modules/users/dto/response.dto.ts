import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
export class UserSerializerDto {
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
  @Expose()
  favoriteMovies: string[];

  @IsOptional()
  @IsString()
  @Expose()
  token: string;

  @IsOptional()
  @Expose()
  createdAt: Date;
}

export class UserResponseDto {
  @Type(() => UserSerializerDto)
  @Expose()
  data: UserSerializerDto;

  @Expose()
  message: string;
}
