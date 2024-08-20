import { Controller, Get, UseFilters, Query } from '@nestjs/common';
import { FindAllDto } from './sale-client-history.dto';
import { SaleClientHistoryService } from './sale-client-history.service';
import { HttpExceptionFilter } from '../../common/exceptions';

@Controller('sale-client-history')
export class SaleClientHistoryController {
  constructor(private readonly service: SaleClientHistoryService) {}

  @Get()
  @UseFilters(new HttpExceptionFilter())
  findAll(@Query() filters: FindAllDto) {
    return this.service.findAll(filters);
  }
}
