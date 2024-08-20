import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ProjectPropertyFeaturesDto } from './project-property-features.dto';
import { PropertyFeaturesModel } from '../property-features/property-features.model';
import { ProjectModel } from '../project/project.model';

@Table({
  tableName: 'project-property-features',
  indexes: [{ unique: true, fields: ['project_id', 'property_feature_id'] }],
})
export class ProjectPropertyFeaturesModel extends Model<ProjectPropertyFeaturesDto> {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  project_property_feature_id: number;

  @ForeignKey(() => ProjectModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  project_id: number;
  @BelongsTo(() => ProjectModel, 'project_id')
  project: ProjectModel;

  @ForeignKey(() => PropertyFeaturesModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  property_feature_id: number;
  @BelongsTo(() => PropertyFeaturesModel, 'property_feature_id')
  property_features: PropertyFeaturesModel;
}
