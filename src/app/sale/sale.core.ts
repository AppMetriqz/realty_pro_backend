import { FindAttributeOptions, Includeable, Transaction } from 'sequelize';
import { ContactModel } from '../contact/contact.model';
import { ProjectModel } from '../project/project.model';
import { UnitModel } from '../unit/unit.model';
import { DateTime } from 'luxon';
import { CreateDto as NotificationCreateDto } from '../notification/notification.dto';
import { NotificationModel } from '../notification/notification.model';

interface createNotificationsType {
  seller_id: number;
  commission: number;
  create_by: number;
  sale_id: number;
  transaction: Transaction;
  Notification: typeof NotificationModel;
  Contact: typeof ContactModel;
}

export const ModelProperties: {
  attributes: FindAttributeOptions;
  include: Includeable | Includeable[];
} = {
  attributes: {
    exclude: ['spouse_id', 'client_id', 'seller_id', 'project_id', 'unit_id'],
  },
  include: [
    {
      model: ProjectModel,
      attributes: ['project_id', 'name'],
    },
    {
      model: UnitModel,
      attributes: ['unit_id', 'name'],
    },
    {
      model: ContactModel,
      as: 'client',
      attributes: [
        'contact_id',
        'first_name',
        'last_name',
        'email',
        'phone_number_1',
        'phone_number_1',
        'national_id',
      ],
    },
    {
      model: ContactModel,
      as: 'seller',
      attributes: [
        'contact_id',
        'first_name',
        'last_name',
        'email',
        'phone_number_1',
        'phone_number_1',
        'national_id',
      ],
    },
  ],
};

export const createNotifications = async ({
  seller_id,
  commission,
  create_by,
  sale_id,
  transaction,
  Notification,
  Contact,
}: createNotificationsType) => {
  const seller = await Contact.findByPk(seller_id);
  const notification_date = DateTime.now().toFormat('yyyy-LL-dd');
  const notification_type = 'sales';
  const notifications: NotificationCreateDto = {
    name: 'Venta',
    description: `Vendedor: ${seller.first_name} ${seller.last_name}, Comision: ${commission * 100}%`,
    notification_type: notification_type,
    notification_type_id: sale_id,
    notification_date: notification_date,
    isNotes: true,
    create_by: create_by,
  };
  await Notification.create(notifications, { transaction });
};
