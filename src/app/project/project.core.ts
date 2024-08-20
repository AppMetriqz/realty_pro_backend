import { ProjectPropertyFeaturesModel } from '../project-property-features/project-property-features.model';

export const ModelProperties = {
  include: [
    {
      model: ProjectPropertyFeaturesModel,
      attributes: ['property_feature_id'],
    },
  ],
};
