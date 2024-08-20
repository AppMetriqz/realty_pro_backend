import { IsNotEmpty, IsEnum, ValidateIf } from 'class-validator';
import * as _ from 'lodash';
import { NotificationType } from '../../common/constants';

export class NotificationDto {
  notification_id: number;
  name: string;
  description: string;
  notification_type: string;
  notification_type_id: number;
  notification_date: string;
  isNotes: boolean;
  status: string;
  is_active: boolean;
  create_by: number;
  update_by: number;
}

export class CreateDto {
  name: string;
  description: string;
  notification_type: string;
  notification_type_id: number;
  notification_date: string;
  isNotes?: boolean;
  create_by: number;
}

export class UpdateDto {
  name: string;
  description: string;
  notification_type: string;
  notification_type_id: number;
  notification_date: string;
  isNotes?: boolean;
  status: string;
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

  @IsEnum(NotificationType, {
    message:
      'notification_type must be one of the following values: ' +
      _.join(NotificationType, ' | '),
  })
  @IsNotEmpty()
  notification_type: string;

  @IsNotEmpty()
  notification_type_id: string;

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
