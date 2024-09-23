import {
  IsNotEmpty,
  IsEnum,
  ValidateIf,
  IsString,
  IsArray,
} from 'class-validator';
import * as _ from 'lodash';
import { ProjectPropertyFeaturesDto } from '../project-property-features/project-property-features.dto';
import { Transform } from 'class-transformer';

export class ProjectDto {
  project_id?: number;
  name: string;
  description: string;
  notes: string;
  type: string;
  currency_type: string;
  levels_qty: number;
  country_code: string;
  state: string;
  city: string;
  sector: string;
  address: string;
  latitude: number;
  longitude: number;
  cover_name: string;
  cover_path: string;
  is_active?: boolean;
  create_by?: number;
  update_by?: number;
  property_feature_ids?: number[];
  unit_from_price?: number[];
  unit_to_price?: number[];
  project_property_feature?: ProjectPropertyFeaturesDto[];
}

export class CreateDto {
  name: string;
  description: string;
  type: string;
  currency_type: string;
  levels_qty: number;
  country_code: string;
  state: string;
  city: string;
  sector: string;
  address: string;
  latitude: number;
  longitude: number;
  cover_name: string;
  cover_path: string;

  @Transform((value) => _.map(_.split(value.value, ','), (n) => _.toNumber(n)))
  @IsArray()
  property_feature_ids: number[];

  is_active: boolean;
  create_by: number;
  update_by: number;
}

export class UpdateDto {
  name: string;
  description: string;
  type: string;
  currency_type: string;
  levels_qty: number;
  country_code: string;
  state: string;
  city: string;
  sector: string;
  address: string;
  latitude: number;
  longitude: number;
  cover_name: string;
  cover_path: string;

  @ValidateIf((o) => !_.isUndefined(o.property_feature_ids))
  @Transform((value) => _.map(_.split(value.value, ','), (n) => _.toNumber(n)))
  @IsArray()
  property_feature_ids: number[];

  is_active: boolean;
  create_by: number;
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
}

export class FindAllAutocompleteDto {
  @IsString()
  description: string;

  @ValidateIf((o) => _.isString(o.currencyType) && o.currencyType !== '')
  @IsEnum(['US', 'RD'])
  currencyType: string;

  @Transform(({ value }) => _.toNumber(value))
  limit: number;
}
