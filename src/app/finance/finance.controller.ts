import { Controller, Get, UseFilters, Query } from '@nestjs/common';
import { FindAllDto } from './finance.dto';
import { FinanceService } from './finance.service';
import { HttpExceptionFilter } from '../../common/exceptions';

@Controller('finances')
export class FinanceController {
  constructor(private readonly service: FinanceService) {}

  @Get()
  @UseFilters(new HttpExceptionFilter())
  findAll(@Query() filters: FindAllDto) {
    return this.service.findAll(filters);
  }

}
