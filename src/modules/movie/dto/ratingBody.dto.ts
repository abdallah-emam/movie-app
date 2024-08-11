import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class RatingBodyDto {
  @ApiProperty({
    example: 5,
    description: 'The rating of the movie between 0 and 10',
  })
  @Max(10)
  @Min(0)
  @IsNumber()
  rating: number;
}
