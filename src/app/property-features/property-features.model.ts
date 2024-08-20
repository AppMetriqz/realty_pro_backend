import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
} from 'sequelize-typescript';
import { PropertyFeaturesDto } from './property-features.dto';
import { PropertyType } from '../../common/constants';

@Table({
  tableName: 'property-features',
  indexes: [{ unique: true, fields: ['description'] }],
})
export class PropertyFeaturesModel extends Model<PropertyFeaturesDto> {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  property_feature_id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  description: string;

  @Column({
    type: DataType.ENUM(...['all', ...PropertyType]),
    defaultValue: 'all',
  })
  type: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  is_active: boolean;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  create_by: number;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  update_by: number;
}
