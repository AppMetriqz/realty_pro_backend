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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  CreateDto,
  DeleteAllDto,
  DeleteDto,
  FindAllAutocompleteDto,
  FindAllDto,
  UpdateAllDto,
  UpdateDto,
} from './unit.dto';
import { UnitService } from './unit.service';
import { CatchException, HttpExceptionFilter } from '../../common/exceptions';
import * as _ from 'lodash';
import { ExceptionDto } from '../../common/dto/http-exception-filter.dto';
import { CurrentUser } from '../../common/decorators';
import { CurrentUserDto } from '../../common/dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomFileValidator } from '../../common/pipe/file';
import * as multer from 'multer';

@Controller('units')
export class UnitController {
  constructor(private readonly service: UnitService) {}

  @Get()
  @UseFilters(new HttpExceptionFilter())
  findAll(@Query() filters: FindAllDto) {
    return this.service.findAll(filters);
  }

  @Get('autocomplete')
  @UseFilters(new HttpExceptionFilter())
  findAllAutocomplete(@Query() filters: FindAllAutocompleteDto) {
    return this.service.findAllAutocomplete(filters);
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
  @UseInterceptors(
    FileInterceptor('cover', { storage: multer.memoryStorage() }),
  )
  @UseFilters(new HttpExceptionFilter())
  async create(
    @Body() body: CreateDto,
    @CurrentUser() currentUser: CurrentUserDto,
    @UploadedFile(new CustomFileValidator()) file: Express.Multer.File,
  ) {
    return this.service.create({ body, currentUser, file });
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('cover'))
  @UseFilters(new HttpExceptionFilter())
  async update(
    @Param('id') id: number,
    @Body() body: UpdateDto,
    @CurrentUser() currentUser: CurrentUserDto,
    @UploadedFile(new CustomFileValidator()) file: Express.Multer.File,
  ) {
    const response: unknown = await this.service.update({
      id,
      body,
      currentUser,
      file,
    });
    const error = response as ExceptionDto;
    const model = response as UpdateDto;

    if (_.isNumber(error?.statusCode)) {
      return new CatchException().Error(error);
    }
    return model;
  }

  @Put('all/:project_id')
  @UseInterceptors(
    FileInterceptor('cover', { storage: multer.memoryStorage() }),
  )
  @UseFilters(new HttpExceptionFilter())
  async updateAll(
    @Param('project_id') id: number,
    @Body() body: UpdateAllDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    const response: unknown = await this.service.updateAll({
      id,
      body,
      currentUser,
    });
    const error = response as ExceptionDto;
    const model = response as UpdateAllDto;

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
      currentUser,
      body,
    });
    const error = response as ExceptionDto;
    const message = response as { message: string };

    if (_.isNumber(error?.statusCode)) {
      return new CatchException().Error(error);
    }
    return message;
  }

  @Delete('all/:project_id')
  @UseFilters(new HttpExceptionFilter())
  async removeAll(
    @Body() body: DeleteAllDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    const response: unknown = await this.service.removeAll({
      currentUser,
      body,
    });
    const error = response as ExceptionDto;
    const message = response as { message: string };

    if (_.isNumber(error?.statusCode)) {
      return new CatchException().Error(error);
    }
    return message;
  }
}
