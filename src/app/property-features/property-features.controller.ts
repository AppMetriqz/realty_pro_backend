import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseFilters,
  Query,
  Put,
} from '@nestjs/common';
import { PropertyFeaturesService } from './property-features.service';
import { FindAllDto, CreateDto, UpdateDto } from './property-features.dto';

import { CatchException, HttpExceptionFilter } from '../../common/exceptions';
import { ExceptionDto } from '../../common/dto/http-exception-filter.dto';
import * as _ from 'lodash';
import { CurrentUser } from '../../common/decorators';
import { CurrentUserDto } from '../../common/dto';

@Controller('property-features')
export class PropertyFeaturesController {
  constructor(private readonly service: PropertyFeaturesService) {}

  @Get()
  @UseFilters(new HttpExceptionFilter())
  findAll(@Query() filters: FindAllDto) {
    return this.service.findAll(filters);
  }

  @Get(':id')
  @UseFilters(new HttpExceptionFilter())
  async findOne(@Param('id') id: number) {
    const response: unknown = await this.service.findOne({ id });
    const error = response as ExceptionDto;
    const model = response as UpdateDto;

    if (_.isNumber(error?.statusCode)) {
      return new CatchException().Error(error);
    }
    return model;
  }

  @Post()
  @UseFilters(new HttpExceptionFilter())
  async create(
    @Body() body: CreateDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    return this.service.create({ body, currentUser });
  }

  @Put(':id')
  @UseFilters(new HttpExceptionFilter())
  async update(
    @Param('id') id: number,
    @Body() body: UpdateDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    const response: unknown = await this.service.update({
      id,
      body,
      currentUser,
    });
    const error = response as ExceptionDto;
    const model = response as UpdateDto;

    if (_.isNumber(error?.statusCode)) {
      return new CatchException().Error(error);
    }
    return model;
  }

  @Delete(':id')
  @UseFilters(new HttpExceptionFilter())
  async remove(
    @Param('id') id: number,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    const response: unknown = await this.service.remove({ id, currentUser });
    const error = response as ExceptionDto;
    const message = response as { message: string };

    if (_.isNumber(error?.statusCode)) {
      return new CatchException().Error(error);
    }
    return message;
  }
}
