import { IsEnum, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import * as _ from 'lodash';

export class FindAllDto {
  @IsNotEmpty()
  @Transform((value) => _.toNumber(value.value))
  pageSize: number;

  @IsNotEmpty()
  @Transform((value) => _.toNumber(value.value))
  pageIndex: number;
}

export enum TimesEnumDto {
  today = 'today',
  next_7_days = 'next_7_days',
  next_month = 'next_month',
}

export class GoogleCalendarDto {
  @IsEnum(['today', 'next_7_days', 'next_month'])
  times: keyof typeof TimesEnumDto;
}
