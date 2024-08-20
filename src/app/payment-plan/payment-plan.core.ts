import { FindAttributeOptions, Includeable, Transaction } from 'sequelize';
import { DateTime } from 'luxon';
import { CreateDto as NotificationCreateDto } from '../notification/notification.dto';
import { NotificationModel } from '../notification/notification.model';

interface createNotificationsType {
  description1: string;
  description2?: string;
  create_by: number;
  sale_id: number;
  dateFormat: string;
  transaction: Transaction;
  Notification: typeof NotificationModel;
}

export const ModelProperties: {
  attributes?: FindAttributeOptions;
  include?: Includeable | Includeable[];
} = {};

export const createNotifications = async ({
  description1,
  description2,
  create_by,
  sale_id,
  dateFormat,
  transaction,
  Notification,
}: createNotificationsType) => {
  const notification_date = DateTime.now().toFormat(dateFormat);
  const notification_type = 'sales';
  const notifications: NotificationCreateDto[] = [
    {
      name: 'Planes de pago',
      description: description1,
      notification_type: notification_type,
      notification_type_id: sale_id,
      notification_date: notification_date,
      create_by: create_by,
    },
  ];
  if (description2) {
    notifications.push({
      name: 'Planes de pago',
      description: description2,
      notification_type: notification_type,
      notification_type_id: sale_id,
      notification_date: notification_date,
      create_by: create_by,
    });
  }
  await Notification.bulkCreate(notifications, {
    transaction,
    ignoreDuplicates: true,
  });
};
