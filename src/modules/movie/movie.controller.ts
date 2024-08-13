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
import { Public } from 'src/common/decorators/public.decorator';
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
  // @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create new movie for admin only' })
  async create(@Body() createMovieDto: CreateMovieDto) {
    return await this.movieService.create(createMovieDto);
  }

  @Get('/get-third-party-movies')
  @Public()
  @ApiOperation({ summary: 'Fetch movies from third party api' })
  fetchAndStoreMovies() {
    return this.movieService.fetchAndStoreMovies();
  }

  @Get('/all')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get all movies' })
  async findAll(
    @GetUser() user: UserDocument,
    @Query() query: PaginationWithFilterDto,
  ) {
    return await this.movieService.findAll(query, user);
  }

  @Get(':id')
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get movie by id' })
  async findOne(@Param('id') id: string) {
    return await this.movieService.findOne(id);
  }

  @Patch(':id')
  // @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update movie by id for admin only' })
  async update(
    @Param('id') id: string,
    @Body() updateMovieDto: UpdateMovieDto,
  ) {
    return await this.movieService.update(id, updateMovieDto);
  }

  @Delete(':id')
  // @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete movie by id for admin only' })
  async remove(@Param('id') id: string) {
    return await this.movieService.remove(id);
  }

  @Post(':id/rate')
  @Roles(Role.USER)
  async rateMovie(@Param('id') id: string, @Body() { rating }: RatingBodyDto) {
    return await this.movieService.rateMovie(id, rating);
  }
}
