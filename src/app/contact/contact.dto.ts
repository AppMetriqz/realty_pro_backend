import { IsNotEmpty, IsEnum, ValidateIf, IsString } from 'class-validator';
import * as _ from 'lodash';
import { ContactType, ContactTypeEnumDto } from '../../common/constants';

export class ContactDto {
  contact_id: number;
  type: string;
  spouse_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number_1: string;
  phone_number_2: string;
  national_id: string;
  nationality: string;
  contact_method: string;
  date_of_birth: Date;
  marital_status: string;
  notes: string;
  is_active: boolean;
  create_by: number;
  update_by: number;
}

export class CreateDto {
  contact_id: number;
  type: string;
  spouse_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number_1: string;
  phone_number_2?: string;
  national_id: string;
  nationality: string;
  contact_method: string;
  date_of_birth: Date;
  marital_status: string;
  notes?: string;
  is_active?: boolean;
  create_by?: number;
  update_by?: number;
}

export class UpdateDto {
  contact_id: number;
  type: string;
  spouse_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number_1: string;
  phone_number_2: string;
  national_id: string;
  nationality: string;
  contact_method: string;
  date_of_birth: Date;
  marital_status: string;
  notes: string;
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

export class FindAllPaymentPlansDto {
  @IsNotEmpty()
  @IsEnum(['active', 'financed'])
  status: string;
}

export class FindAllAutocompleteDto {
  description: string;

  @ValidateIf((o) => _.isString(o.type) && o.type !== '')
  @IsEnum(ContactType)
  type: keyof typeof ContactTypeEnumDto;
}
