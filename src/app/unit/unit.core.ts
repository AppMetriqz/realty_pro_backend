import { UnitPropertyFeaturesModel } from '../unit-property-features/unit-property-features.model';
import { ProjectModel } from '../project/project.model';
import { PropertyFeaturesModel } from '../property-features/property-features.model';
import { SaleModel } from '../sale/sale.model';
import { ContactModel } from '../contact/contact.model';

export const ModelProperties = {
  include: [
    {
      model: ProjectModel,
      attributes: [
        'name',
        'state',
        'city',
        'sector',
        'address',
        'currency_type',
        'country_code',
      ],
    },
    {
      model: UnitPropertyFeaturesModel,
      include: [
        {
          model: PropertyFeaturesModel,
          attributes: ['property_feature_id', 'description'],
        },
      ],
    },
    {
      model: SaleModel,
      attributes: ['sale_id', 'client_id'],
      include: [
        {
          model: ContactModel,
          as: 'client',
          attributes: ['contact_id', 'first_name', 'last_name'],
        },
      ],
    },
  ],
};
