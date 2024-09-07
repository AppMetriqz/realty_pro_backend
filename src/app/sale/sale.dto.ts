import { IsNotEmpty, IsEnum, ValidateIf, IsArray } from 'class-validator';
import * as _ from 'lodash';
import { Transform } from 'class-transformer';
import { ContactDto } from '../contact/contact.dto';

export class SaleDto {
  sale_id: number;
  project_id: number;
  unit_id: number;
  client_id: number;
  seller_id: number;
  price: number;
  commission: number;
  amount_pending_sale?: number;
  notes: string;
  financed_at?: Date;
  stage: string;
  is_active: boolean;
  create_by: number;
  update_by: number;
  created_at: string;
  client?: ContactDto;
}

export class CreateDto {
  @IsNotEmpty()
  project_id: number;

  @IsNotEmpty()
  unit_id: number;

  @IsNotEmpty()
  client_id: number;

  seller_id?: number;

  @IsNotEmpty()
  commission: number;

  price?: number;
  create_by?: number;
}

export class CreateAllDto {
  @IsNotEmpty()
  project_id: number;

  @IsNotEmpty()
  client_id: number;

  seller_id?: number;

  price?: number;

  @IsNotEmpty()
  commission: number;

  @Transform((value) => _.map(_.split(value.value, ','), (n) => _.toNumber(n)))
  @IsArray()
  unit_ids?: number[];

  create_by?: number;
}

export class UpdateDto {
  project_id: number;
  unit_id: number;
  client_id: number;
  seller_id: number;
  price: number;
  commission: number;
  stage: string;
  financed_at?: Date;
  notes: string;
  update_by: number;
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

  @IsNotEmpty()
  @Transform((value) => _.split(value.value, ',').filter((v) => v !== ''))
  @IsArray()
  stage: string[];

  @ValidateIf((o) => _.isString(o.projectId) && o.projectId !== '')
  @Transform((value) => _.toNumber(value.value))
  projectId: number;

  @Transform(({ value }) => value ?? '')
  searchText: string;
}
