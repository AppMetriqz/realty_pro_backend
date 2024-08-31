import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import * as _ from 'lodash';

export class UserDto {
  user_id?: number;
  role_id: number;
  status_id?: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  password: string;
  national_id: string;
  notes?: string;
  is_active?: boolean;
  create_by?: number;
  update_by?: number;
}

export class CreateDto {
  role_id: number;
  status_id?: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  password: string;
  national_id: string;
  notes?: string;
  is_active?: boolean;
  create_by?: number;
  update_by?: number;
}

export class UpdateDto {
  role_id: number;
  status_id?: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  password?: string;
  email: string;
  national_id: string;
  notes?: string;
  is_active?: boolean;
  create_by?: number;
  update_by?: number;
}

export class ChangePasswordDto {
  @IsNotEmpty()
  old_password: string;

  @IsNotEmpty()
  new_password: string;
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
}
