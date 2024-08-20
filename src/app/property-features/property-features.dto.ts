import { IsString, IsNotEmpty, ValidateIf, IsEnum } from 'class-validator';
import * as _ from 'lodash';
import { PropertyType } from '../../common/constants';

export class PropertyFeaturesDto {
  property_feature_id?: number;
  description: string;
  type: string;
  is_active?: boolean;
  create_by?: number;
  update_by?: number;
}

export class CreateDto {
  description: string;
  type: string;
  is_active: boolean;
  create_by: number;
  update_by: number;
}

export class UpdateDto {
  description: string;
  type: string;
  is_active: boolean;
  create_by: number;
  update_by: number;
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

  @ValidateIf((o) => _.isString(o.type) && o.type !== '')
  @IsEnum(['all', ...PropertyType], {
    message: `type must be one of the following values: ${_.join(['all', ...PropertyType], ' | ')}`,
  })
  @IsNotEmpty()
  type: string;
}
