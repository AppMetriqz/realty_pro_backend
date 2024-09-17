import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FindAllDto, GoogleCalendarDto } from './desktop.dto';
import * as _ from 'lodash';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { DateTime } from 'luxon';
import { ProjectModel } from '../project/project.model';
import { UnitModel } from '../unit/unit.model';
import { SaleModel } from '../sale/sale.model';
import { ContactModel } from '../contact/contact.model';
import { Auth, google } from 'googleapis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DesktopService {
  private readonly oAuth2Client: Auth.OAuth2Client;
  private calendar: any;
  constructor(
    @InjectModel(SaleModel) private readonly Sale: typeof SaleModel,
    readonly configService: ConfigService,
  ) {
    this.oAuth2Client = new google.auth.OAuth2(
      configService.get<string>('GOOGLE_CLIENT_ID'),
      configService.get<string>('GOOGLE_CLIENT_SECRET'),
      configService.get<string>('GOOGLE_CALLBACK_URL'),
    );
    this.calendar = google.calendar({ version: 'v3', auth: this.oAuth2Client });
  }

  async findAllGoogleCalendar(req: any, filters: GoogleCalendarDto) {
    const accessToken = req.session.google_access_token;

    console.log('google_access_token', accessToken);
    console.log('cookies', req.cookies);

    if (!accessToken) {
      return {
        isNeedLogin: true,
        data: [],
      };
    }
    this.oAuth2Client.setCredentials({ access_token: accessToken });
    const times = filters.times;
    const now = DateTime.now();
    let timeMin: Date = now.startOf('day').toJSDate();
    let timeMax: Date = now.endOf('day').toJSDate();

    switch (times) {
      case 'today':
        timeMin = now.startOf('day').toJSDate();
        timeMax = now.endOf('day').toJSDate();
        break;
      case 'next_7_days':
        timeMin = now.startOf('day').toJSDate();
        timeMax = now.endOf('day').plus({ day: 7 }).toJSDate();
        break;
      case 'next_month':
        timeMin = now.startOf('month').plus({ month: 1 }).toJSDate();
        timeMax = now.endOf('month').plus({ month: 1 }).toJSDate();
        break;
    }

    // https://developers.google.com/calendar/api/v3/reference/events/list
    // https://medium.com/iceapple-tech-talks/integration-with-google-calendar-api-using-service-account-1471e6e102c8
    // Service accounts: para que un usuario vea los datos de tu cuenta
    // OAuth 2.0: para que cada usuario vea su propios datos
    const response = await this.calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin, // Get all events that start after this date
      timeMax: timeMax,
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const data = _.map(response.data.items, (items) => {
      return {
        summary: items.summary,
        start: items.start.dateTime,
        end: items.end.dateTime,
      };
    });

    return {
      isNeedLogin: false,
      data,
    };
  }

  async findAllSale() {
    return this.Sale.findAll({
      attributes: [
        [Sequelize.fn('YEAR', Sequelize.col('separated_at')), 'year'],
        [Sequelize.fn('MONTH', Sequelize.col('separated_at')), 'month'],
        [Sequelize.fn('Count', Sequelize.col('project_id')), 'total'],
      ],
      where: {
        is_active: true,
        separated_at: {
          [Op.gte]: DateTime.now().minus({ month: 6 }).toJSDate(),
        },
      },
      group: ['month', 'year'],
      order: [['month', 'ASC']],
    });
  }

  async findAllSalesAssigned(filters: FindAllDto) {
    const offset = filters.pageIndex * filters.pageSize;
    const limit = filters.pageSize;

    return this.Sale.findAndCountAll({
      limit,
      offset,
      where: {
        client_id: 1,
        is_active: true,
      },
      include: [
        {
          model: ProjectModel,
          order: [['project_id', 'ASC']],
          attributes: ['project_id', 'name', 'description'],
        },
        {
          model: UnitModel,
          order: [['unit_id', 'ASC']],
          attributes: ['unit_id', 'name', 'description'],
        },
        {
          model: ContactModel,
          as: 'client',
          order: [['first_name', 'ASC']],
          attributes: ['contact_id', 'first_name', 'last_name'],
        },
        {
          model: ContactModel,
          as: 'seller',
          order: [['first_name', 'ASC']],
          attributes: ['contact_id', 'first_name', 'last_name'],
        },
      ],
      order: [[UnitModel, 'name', 'ASC']],
    });
  }

  async findAllPaymentPlansAssign(filters: FindAllDto) {
    const offset = filters.pageIndex * filters.pageSize;
    const limit = filters.pageSize;

    return this.Sale.findAndCountAll({
      limit,
      offset,
      where: {
        stage: 'separation',
        client_id: { [Op.ne]: 1 },
        is_active: true,
      },
      include: [
        {
          model: ProjectModel,
          order: [['project_id', 'ASC']],
          attributes: ['project_id', 'name', 'description', 'currency_type'],
        },
        {
          model: UnitModel,
          order: [['name', 'ASC']],
          attributes: ['unit_id', 'name', 'description'],
        },
        {
          model: ContactModel,
          as: 'client',
          order: [['first_name', 'ASC']],
          attributes: ['contact_id', 'first_name', 'last_name'],
        },
        {
          model: ContactModel,
          as: 'seller',
          order: [['first_name', 'ASC']],
          attributes: ['contact_id', 'first_name', 'last_name'],
        },
      ],
    });
  }

  async googleCalendarLogin() {
    return this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://www.googleapis.com/auth/calendar.readonly',
    });
  }

  async googleCallback(req: any) {
    const code = req.query.code;
    const { tokens } = await this.oAuth2Client.getToken(code);
    req.session.google_access_token = tokens.access_token;
    this.oAuth2Client.setCredentials({ access_token: tokens.access_token });
    return this.configService.get<string>('GOOGLE_CALLBACK_URL_READY');
  }
}
