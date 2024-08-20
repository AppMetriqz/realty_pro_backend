import { ContactModel } from './contact.model';
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
      model: ContactModel,
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
