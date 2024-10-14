import {
  IsNotEmpty,
  IsEnum,
  ValidateIf,
  Min,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import * as _ from 'lodash';
import {
  CurrencyEnumDto,
  CurrencyType,
  PlanFilterStats,
} from '../../common/constants';

export class PaymentPlanDto {
  payment_plan_id: number;
  sale_id: number;
  project_id: number;
  unit_id: number;
  sale_type: string;
  separation_amount: number;
  separation_date: string;
  payment_plan_numbers: number;
  separation_rate: number;
  total_amount: number;
  total_amount_paid?: number;
  status: string;
  paid_at: string | Date;
  notes: string;
  is_active: boolean;
  create_by: number;
  update_by: number;
}

export class CreateDto {
  @IsNotEmpty()
  sale_id: number;

  @IsNotEmpty()
  @Min(1)
  separation_amount: number;

  @IsNotEmpty()
  separation_date: string;

  @IsNotEmpty()
  @Min(1)
  payment_plan_numbers: number;

  @IsNotEmpty()
  separation_rate: number;

  @IsNotEmpty()
  is_resale: boolean;

  @ValidateIf((o) => o.is_resale === true)
  @IsNotEmpty()
  @Min(1)
  total_amount: number;

  @ValidateIf((o) => o.is_resale === true)
  @IsNotEmpty()
  @Min(1)
  client_id: number;

  create_by?: number;
}

export class UpdateDto {
  sale_id: number;
  separation_amount: number;
  separation_date: string;
  payment_plan_numbers: number;
  separation_rate: number;
  status: string;
  notes: string;
  is_active: boolean;
  create_by: number;
  update_by: number;
}

export class DeleteDto {
  @IsNotEmpty()
  notes: string;

  @IsNotEmpty()
  @IsBoolean()
  isDelete: boolean;
}

export class FindAllDto {
  @IsNotEmpty()
  pageSize: string;

  @IsNotEmpty()
  pageIndex: string;

  @ValidateIf((o) => _.isString(o.sortOrder) && o.sortOrder !== '')
  @IsEnum(['DESC', 'ASC'])
  @IsNotEmpty()
  sortOrder: string;

  @ValidateIf((o) => _.isString(o.sortBy) && o.sortBy !== '')
  @IsNotEmpty()
  sortBy: string;

  @ValidateIf((o) => _.isString(o.dateTo) && o.dateTo !== '')
  @IsNotEmpty()
  dateFrom: string;

  @ValidateIf((o) => _.isString(o.dateFrom) && o.dateFrom !== '')
  @IsNotEmpty()
  dateTo: string;

  @ValidateIf((o) => _.isString(o.PlanFilterStats) && o.PlanFilterStats !== '')
  @IsEnum(PlanFilterStats, {
    message:
      'filterBy must be one of the following values: ' +
      _.join(PlanFilterStats, ' | '),
  })
  @IsNotEmpty()
  planFilterStats: string;

  @IsNotEmpty()
  @Transform((value) =>
    _.map(
      _.split(value.value, ',').filter((item) => item !== ''),
      (n) => _.toNumber(n),
    ),
  )
  @IsArray()
  projectIds: number[];

  @ValidateIf((o) => _.isString(o.currencyType) && o.currencyType !== '')
  @IsEnum(CurrencyType, { message: 'values available : US | RD' })
  currencyType: keyof typeof CurrencyEnumDto;
}

export class FindStatsDto {
  @IsNotEmpty()
  @Transform((value) =>
    _.map(
      _.split(value.value, ',').filter((item) => item !== ''),
      (n) => _.toNumber(n),
    ),
  )
  @IsArray()
  projectIds: number[];

  @ValidateIf((o) => _.isString(o.currencyType) && o.currencyType !== '')
  @IsEnum(CurrencyType, { message: 'values available : US | RD' })
  currencyType: keyof typeof CurrencyEnumDto;
}
