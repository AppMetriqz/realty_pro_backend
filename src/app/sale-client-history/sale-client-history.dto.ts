import { IsNotEmpty, IsEnum, ValidateIf } from 'class-validator';
import * as _ from 'lodash';

export class SaleClientHistoryDto {
  sale_history_id: number;
  sale_id: number;
  client_id: number;
  notes: string;
  is_active: boolean;
  create_by: number;
  update_by: number;
}

export class CreateDto {
  @IsNotEmpty()
  sale_id: number;

  @IsNotEmpty()
  client_id: number;

  notes?: number;
  create_by?: number;
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
