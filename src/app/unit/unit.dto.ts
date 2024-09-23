import {
  IsNotEmpty,
  IsEnum,
  ValidateIf,
  IsString,
  IsArray,
  IsIn,
} from 'class-validator';
import * as _ from 'lodash';
import { UnitStatus } from '../../common/constants';
import { Transform } from 'class-transformer';
import { UnitPropertyFeaturesDto } from '../unit-property-features/unit-property-features.dto';
import { SaleDto } from '../sale/sale.dto';

export class UnitDto {
  unit_id: number;
  project_id: number;
  name: string;
  description: string;
  notes: string;
  type: string;
  condition: string;
  levels_qty: number;
  level: number;
  meters_of_land: number;
  meters_of_building: number;
  rooms: number;
  bathrooms: number;
  price_per_meter: number;
  price: number;
  cover_name: string;
  cover_path: string;
  status: string;
  is_active: boolean;
  create_by?: number;
  update_by?: number;
  property_feature_ids?: number[];
  unit_property_feature?: UnitPropertyFeaturesDto[];
  sale?: SaleDto;
}

export class CreateDto {
  project_id: number;
  name: string;
  description: string;
  type: string;
  condition: string;
  levels_qty: number;
  level: number;
  meters_of_land: number;
  meters_of_building: number;
  rooms: number;
  bathrooms: number;
  price: number;
  price_per_meter: number;
  cover_name: string;
  cover_path: string;
  status: string;

  @Transform((value) =>
    _.map(
      _.split(value.value, ',').filter((v) => v !== ''),
      (n) => _.toNumber(n),
    ),
  )
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
  condition: string;
  levels_qty: number;
  level: number;
  meters_of_land: number;
  meters_of_building: number;
  rooms: number;
  bathrooms: number;
  price: number;
  price_per_meter: number;
  cover_name: string;
  cover_path: string;
  status: string;

  @Transform((value) =>
    _.map(
      _.split(value.value, ',').filter((v) => v !== ''),
      (n) => _.toNumber(n),
    ),
  )
  @IsArray()
  property_feature_ids: number[];

  is_active: boolean;
  create_by: number;
  update_by: number;
}

export class UpdateAllDto {
  condition: string;

  price_per_meter: number;

  price: number;

  status: string;

  @Transform((value) => _.map(_.split(value.value, ','), (n) => _.toNumber(n)))
  @IsArray()
  unit_ids: number[];

  // @Transform((value) => _.map(_.split(value.value, ','), (n) => _.toNumber(n)))
  // @IsArray()
  // property_feature_ids: number[];
}

export class DeleteDto {
  @IsNotEmpty()
  notes: string;
}

export class DeleteAllDto {
  @IsNotEmpty()
  notes: string;

  @Transform((value) => _.map(_.split(value.value, ','), (n) => _.toNumber(n)))
  @IsArray()
  unit_ids: number[];
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

  @Transform((value) => _.split(value.value, ',').filter((v) => v !== ''))
  @IsIn(UnitStatus, { each: true })
  status: string[];

  @ValidateIf((o) => _.isString(o.dateFrom) && o.dateFrom !== '')
  @IsNotEmpty()
  dateTo: string;

  @ValidateIf((o) => _.isString(o.projectId) && o.projectId !== '')
  @Transform((value) => _.toNumber(value.value))
  projectId: number;

  @Transform(({ value }) => value ?? '')
  searchText: string;
}

export class FindAllAutocompleteDto {
  @IsString()
  description: string;
}
