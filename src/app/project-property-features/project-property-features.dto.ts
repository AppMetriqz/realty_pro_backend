import { PropertyFeaturesDto } from '../property-features/property-features.dto';

export class ProjectPropertyFeaturesDto {
  project_property_feature_id?: number;
  project_id: number;
  property_feature_id: number;
  property_features?: PropertyFeaturesDto;
}
