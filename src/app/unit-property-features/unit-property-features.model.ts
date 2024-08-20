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
import { UnitPropertyFeaturesDto } from './unit-property-features.dto';
import { PropertyFeaturesModel } from '../property-features/property-features.model';
import { UnitModel } from '../unit/unit.model';
import { ProjectModel } from '../project/project.model';

@Table({
  tableName: 'unit-property-features',
  indexes: [{ unique: true, fields: ['unit_id', 'property_feature_id'] }],
})
export class UnitPropertyFeaturesModel extends Model<UnitPropertyFeaturesDto> {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  project_property_feature_id: number;

  @ForeignKey(() => ProjectModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  project_id: number;
  @BelongsTo(() => ProjectModel, 'project_id')
  project: ProjectModel;

  @ForeignKey(() => UnitModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  unit_id: number;
  @BelongsTo(() => UnitModel, 'unit_id')
  unit: UnitModel;

  @ForeignKey(() => PropertyFeaturesModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  property_feature_id: number;
  @BelongsTo(() => PropertyFeaturesModel, 'property_feature_id')
  property_features: PropertyFeaturesModel;
}
