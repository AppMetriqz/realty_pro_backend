import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseFilters,
  Query,
  Delete,
} from '@nestjs/common';
import { CreateAllDto, CreateDto, FindAllDto, UpdateDto } from './sale.dto';
import { SaleService } from './sale.service';
import { CatchException, HttpExceptionFilter } from '../../common/exceptions';
import * as _ from 'lodash';
import { ExceptionDto } from '../../common/dto/http-exception-filter.dto';
import { CurrentUser } from '../../common/decorators';
import { CurrentUserDto } from '../../common/dto';
import { DeleteDto } from '../unit/unit.dto';

@Controller('sales')
export class SaleController {
  constructor(private readonly service: SaleService) {}

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

  @Post('all')
  @UseFilters(new HttpExceptionFilter())
  async createAll(
    @Body() body: CreateAllDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    return this.service.createAll({ body, currentUser });
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
    @Body() body: DeleteDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    const response: unknown = await this.service.remove({
      id,
      body,
      currentUser,
    });
    const error = response as ExceptionDto;
    const message = response as { message: string };

    if (_.isNumber(error?.statusCode)) {
      return new CatchException().Error(error);
    }
    return message;
  }

  @Delete('re-sale/:id')
  @UseFilters(new HttpExceptionFilter())
  async removeResale(
    @Param('id') id: number,
    @Body() body: DeleteDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    const response: unknown = await this.service.removeResale({
      id,
      body,
      currentUser,
    });
    const error = response as ExceptionDto;
    const message = response as { message: string };

    if (_.isNumber(error?.statusCode)) {
      return new CatchException().Error(error);
    }
    return message;
  }
}
