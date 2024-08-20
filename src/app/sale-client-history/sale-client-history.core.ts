import { FindAttributeOptions, Includeable } from 'sequelize';

export const ModelProperties: {
  attributes?: FindAttributeOptions;
  include?: Includeable | Includeable[];
} = {};
