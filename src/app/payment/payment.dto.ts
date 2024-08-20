import { IsNotEmpty, IsEnum, ValidateIf, Min } from 'class-validator';
import * as _ from 'lodash';

export class PaymentDto {
  payment_id: number;
  payment_plan_id: number;
  project_id: number;
  unit_id: number;
  sale_id: number;
  amount: number;
  notes: string;
  status: string;
  is_active: boolean;
  create_by: number;
  update_by: number;
}

export class CreateDto {
  @IsNotEmpty()
  payment_plan_id: number;

  @Min(1)
  @IsNotEmpty()
  amount: number;

  notes?: string;
}

export class UpdateDto {
  @IsNotEmpty()
  payment_plan_detail_id: number;

  @Min(1)
  @IsNotEmpty()
  amount: number;

  notes?: string;
}

export class DeleteDto {
  @IsNotEmpty()
  notes: string;
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
}
