import { Controller, Get, UseFilters, Query, Req, Res } from '@nestjs/common';
import { FindAllDto, GoogleCalendarDto } from './desktop.dto';
import { DesktopService } from './desktop.service';
import { CatchException, HttpExceptionFilter } from '../../common/exceptions';
import { Public } from '../../common/decorators';
import { Response, Request } from 'express';
import * as _ from 'lodash';
import { ExceptionDto } from '../../common/dto/http-exception-filter.dto';

@Controller('desktop')
export class DesktopController {
  constructor(private readonly service: DesktopService) {}

  @Public()
  @Get('google/calendar-login')
  @UseFilters(new HttpExceptionFilter())
  async googleCalendarLogin(@Res() res: Response) {
    const url = await this.service.googleCalendarLogin();
    res.redirect(302, url);
  }

  @Public()
  @Get('google/callback')
  @UseFilters(new HttpExceptionFilter())
  googleCallback(@Req() req: Request) {
    return this.service.googleCallback(req);
  }

  @Get('google/calendar')
  @UseFilters(new HttpExceptionFilter())
  async findAllGoogleCalendar(@Query() filters: GoogleCalendarDto) {
    const response = await this.service.findAllGoogleCalendar(filters);
    const error = response as ExceptionDto;
    if (_.isNumber(error?.statusCode)) {
      return new CatchException().Error(error);
    }
    return response;
  }

  @Get('sales')
  @UseFilters(new HttpExceptionFilter())
  findAllSale() {
    return this.service.findAllSale();
  }

  @Get('sales-to-assign')
  @UseFilters(new HttpExceptionFilter())
  findAllSalesAssigned(@Query() filters: FindAllDto) {
    return this.service.findAllSalesAssigned(filters);
  }

  @Get('payment-plans-to-assign')
  @UseFilters(new HttpExceptionFilter())
  findAllPaymentPlansAssign(@Query() filters: FindAllDto) {
    return this.service.findAllPaymentPlansAssign(filters);
  }
}
