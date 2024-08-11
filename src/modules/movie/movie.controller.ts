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
import { Roles } from 'src/common/decorators/roles.decorators';
import { PaginationWithFilterDto } from 'src/utilities/classes';
import { Role } from '../users/enum/role.enum';
import { CreateMovieDto } from './dto/create-movie.dto';
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
  @Public()
  @ApiOperation({ summary: 'Get all movies' })
  findAll(@Query() query: PaginationWithFilterDto) {
    return this.movieService.findAll(query);
  }

  @Get(':id')
  @Public()
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
}
