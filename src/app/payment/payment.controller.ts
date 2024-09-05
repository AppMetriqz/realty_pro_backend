import { Controller, Get, Post, Body, UseFilters, Query } from '@nestjs/common';
import { CreateDto, FindAllDto } from './payment.dto';
import { PaymentService } from './payment.service';
import { HttpExceptionFilter } from '../../common/exceptions';

import { CurrentUser } from '../../common/decorators';
import { CurrentUserDto } from '../../common/dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  @Get()
  @UseFilters(new HttpExceptionFilter())
  findAll(@Query() filters: FindAllDto) {
    return this.service.findAll(filters);
  }

  @Post()
  @UseFilters(new HttpExceptionFilter())
  async create(
    @Body() body: CreateDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    return this.service.create({ body, currentUser });
  }
}
