import { Controller, Get, Query, Req, Res, UseFilters } from '@nestjs/common';
import { FindAllDto, GoogleCalendarDto } from './desktop.dto';
import { DesktopService } from './desktop.service';
import { HttpExceptionFilter } from '../../common/exceptions';
import { Public } from '../../common/decorators';
import { Request, Response } from 'express';

@Controller('desktop')
export class DesktopController {
  constructor(private readonly service: DesktopService) {}

  @Public()
  @Get('google/calendar-login')
  @UseFilters(new HttpExceptionFilter())
  async googleCalendarLogin() {
    return await this.service.googleCalendarLogin();
  }

  @Public()
  @Get('google/callback')
  @UseFilters(new HttpExceptionFilter())
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const { url, access_token } = await this.service.googleCallback(req);
    // res.cookie('google_access_token', access_token, {
    //   secure: true,
    //   maxAge: 3600000 * 24,
    //   sameSite: 'none',
    //   domain: '.herokuapp.com',
    // });
    res.cookie('google_access_token1', access_token, {
      secure: true,
      maxAge: 3600000 * 24,
      sameSite: 'none',
    });
    res.cookie('google_access_token2', access_token, {
      secure: true,
      maxAge: 3600000 * 24,
      sameSite: 'none',
    });
    res.redirect(302, url);
  }

  @Get('google/calendar')
  @UseFilters(new HttpExceptionFilter())
  async findAllGoogleCalendar(
    @Req() req: Request,
    @Query() filters: GoogleCalendarDto,
  ) {
    return await this.service.findAllGoogleCalendar(req, filters);
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
