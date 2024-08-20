import { HttpStatus } from '@nestjs/common';

export enum ContactTypeEnumDto {
  seller = 'seller',
  client = 'client',
  office = 'office',
  related = 'related',
}

export const DateFormat = 'yyyy-LL-dd';
export const PropertyType = ['house', 'apartment', 'plot', 'commercial'];
export const CurrencyType = ['US', 'RD'];

export const ContactType = ['seller', 'client', 'office', 'related'];

export const UnitStatus = ['available', 'sold', 'reserved'];

export const StageStatus = [
  'separation',
  'payment_plan_in_progress',
  'payment_plan_completed',
  'financed',
];

export const PlanFilterStats = [
  'overdue_payment',
  'pending_payment',
  'financing_payment',
];

export const MaritalStatuses = [
  'single',
  'married',
  'divorced',
  'widowed',
  'civil_union',
  'separated',
  'cohabitant',
];

export const NotificationType = ['sales'];

export const StatusCodes = {
  FORBIDDEN: {
    statusCode: HttpStatus.FORBIDDEN,
    message: 'forbidden',
    error: 'forbidden',
  },
  NotFound: {
    statusCode: HttpStatus.NOT_FOUND,
    message: 'record no found',
    error: 'no Found',
  },
  BadRequest: {
    statusCode: HttpStatus.BAD_REQUEST,
    message: 'something bad happened',
    error: 'bad Request',
  },
  UnAuthorized: {
    statusCode: HttpStatus.UNAUTHORIZED,
    message: 'no authorization',
    error: 'unAuthorized',
  },
  ServiceUnavailable: {
    statusCode: HttpStatus.SERVICE_UNAVAILABLE,
    message: 'service not available',
    error: 'service Unavailable',
  },
  ServerError: {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'internal server error',
    error: 'internal server error',
  },
};
