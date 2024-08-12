import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Roles } from '../../common/decorators/roles.decorators';
import { PaginationWithFilterDto } from '../../utilities/classes';
import { UserDocument } from '../users/entities/user.entity';
import { Role } from '../users/enum/role.enum';
import { CreateMovieDto } from './dto/create-movie.dto';
import { RatingBodyDto } from './dto/ratingBody.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieService } from './movie.service';

@Controller('movie')
@ApiTags('movie')
@ApiBearerAuth()
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create new movie for admin only' })
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.movieService.create(createMovieDto);
  }

  @Get('/all')
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Get all movies' })
  findAll(
    @GetUser() user: UserDocument,
    @Query() query: PaginationWithFilterDto,
  ) {
    return this.movieService.findAll(query, user);
  }

  @Get(':id')
  @Roles(Role.USER)
  @ApiOperation({ summary: 'Get movie by id' })
  findOne(@Param('id') id: string) {
    return this.movieService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update movie by id for admin only' })
  update(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) {
    return this.movieService.update(id, updateMovieDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete movie by id for admin only' })
  remove(@Param('id') id: string) {
    return this.movieService.remove(id);
  }

  @Post(':id/rate')
  @Roles(Role.USER)
  async rateMovie(@Param('id') id: string, @Body() { rating }: RatingBodyDto) {
    return this.movieService.rateMovie(id, rating);
  }
}
