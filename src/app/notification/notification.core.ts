import { NotificationModel } from './notification.model';
import { FindAttributeOptions, Includeable } from 'sequelize';

export const ModelProperties: {
  attributes: FindAttributeOptions;
  include: Includeable | Includeable[];
} = {
  attributes: {
    exclude: ['spouse_id'],
  },
  include: [
    {
      model: NotificationModel,
      as: 'spouse',
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
