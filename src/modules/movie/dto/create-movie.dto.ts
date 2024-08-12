import { ApiProperty } from '@nestjs/swagger';

export class CreateMovieDto {
  @ApiProperty({ type: String, example: 'The Matrix' })
  title: string;

  @ApiProperty({ type: String, example: 'The Matrix is a computer game' })
  overview: string;

  @ApiProperty({ type: Date, example: '2020-01-01' })
  releaseDate: Date;

  @ApiProperty({ type: String, example: 'matrix.jpg' })
  image: string;

  // genre
  @ApiProperty({ type: [String], example: ['Action', 'Sci-Fi'] })
  genres: string[];
}
