import {
  IsNotEmpty,
  IsEnum,
  ValidateIf,
  IsArray,
  IsEmail,
} from 'class-validator';
import * as _ from 'lodash';
import {
  ContactType,
  ContactTypeEnumDto,
  MaritalStatuses,
  MaritalStatusesEnumDto,
} from '../../common/constants';
import { Transform } from 'class-transformer';

export class ContactDto {
  contact_id: number;
  type: string;
  spouse_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number_1: string;
  phone_number_2: string;
  national_id: string;
  nationality: string;
  address: string;
  workplace: string;
  work_occupation: string;
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
  spouse_id?: number;

  first_name: string;

  last_name: string;

  @Transform(({ value }) => (_.isEmpty(value) ? null : value))
  @ValidateIf((o) => !(_.isNull(o.email) || _.isUndefined(o.email)))
  @IsEmail()
  email: string;

  @Transform(({ value }) => (_.isEmpty(value) ? null : value))
  phone_number_1: string;

  @Transform(({ value }) => (_.isEmpty(value) ? null : value))
  phone_number_2?: string;

  @Transform(({ value }) => (_.isEmpty(value) ? null : value))
  national_id: string;

  address?: string;
  workplace?: string;
  work_occupation?: string;
  nationality: string;
  contact_method: string;

  @Transform(({ value }) => (_.isEmpty(value) ? null : value))
  date_of_birth: Date;

  @Transform(({ value }) => (_.isEmpty(value) ? null : value))
  @ValidateIf(
    (o) => !(_.isNull(o.marital_status) || _.isUndefined(o.marital_status)),
  )
  @IsEnum(MaritalStatuses, { each: true })
  marital_status: keyof typeof MaritalStatusesEnumDto;

  notes?: string;

  create_by?: number;
}

export class UpdateDto {
  contact_id: number;
  type: string;
  spouse_id: number;
  first_name: string;
  last_name: string;

  @Transform(({ value }) => (_.isEmpty(value) ? null : value))
  @ValidateIf((o) => !(_.isNull(o.email) || _.isUndefined(o.email)))
  @IsEmail()
  email: string;

  @Transform(({ value }) => (_.isEmpty(value) ? null : value))
  phone_number_1: string;

  @Transform(({ value }) => (_.isEmpty(value) ? null : value))
  phone_number_2?: string;

  @Transform(({ value }) => (_.isEmpty(value) ? null : value))
  national_id: string;

  address?: string;
  workplace?: string;
  work_occupation?: string;
  nationality: string;
  contact_method: string;

  @Transform(({ value }) => (_.isEmpty(value) ? null : value))
  date_of_birth: Date;

  @Transform(({ value }) => (_.isEmpty(value) ? null : value))
  @ValidateIf(
    (o) => !(_.isNull(o.marital_status) || _.isUndefined(o.marital_status)),
  )
  @IsEnum(MaritalStatuses, { each: true })
  marital_status: keyof typeof MaritalStatusesEnumDto;

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
  @Transform(({ value }) => _.split(value.value, ',').filter((v) => v !== ''))
  @IsArray()
  type: string[];

  @Transform(({ value }) => value ?? '')
  searchText: string;
}

export class FindAllPaymentPlansDto {
  @IsNotEmpty()
  @IsEnum(['sales', 'financed'])
  status: string;
}

export class FindAllAutocompleteDto {
  description: string;

  @ValidateIf((o) => _.isString(o.type) && o.type !== '')
  @IsEnum(ContactType)
  type: keyof typeof ContactTypeEnumDto;
}
