import {
  Model,
  Table,
  Column,
  DataType,
  PrimaryKey,
  ForeignKey,
} from 'sequelize-typescript';
import { UnitDetailsAttributes } from './unit-details.dto';
import { ProjectModel } from '../../project/project.model';
import { PropertyType, UnitStatus } from '../../../common/constants';

@Table({
  tableName: 'Unit_Details',
  timestamps: false,
  comment: 'VIEW',
  freezeTableName: true,
})
export class UnitDetailsView extends Model<UnitDetailsAttributes> {
  @PrimaryKey
  @Column({ type: DataType.INTEGER })
  unit_id: number;

  @ForeignKey(() => ProjectModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  project_id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, defaultValue: null })
  description: string;

  @Column({
    type: DataType.ENUM(...UnitStatus),
    allowNull: false,
  })
  status: string;

  @Column({
    type: DataType.ENUM(...PropertyType),
    allowNull: false,
  })
  type: string;

  @Column({
    type: DataType.ENUM('drawing', 'building', 'ready'),
    allowNull: false,
  })
  condition: string;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  levels_qty: number;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  level: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  meters_of_land: number;

  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: null })
  meters_of_building: number;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  rooms: number;

  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: null })
  bathrooms: number;

  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: null })
  price_per_meter: number;

  @Column({ type: DataType.DOUBLE(20, 2), allowNull: false })
  price: number;

  @Column({ type: DataType.STRING, defaultValue: null, allowNull: true })
  cover_name: string;

  @Column({ type: DataType.STRING, defaultValue: null, allowNull: true })
  cover_path: string;

  @Column({ type: DataType.STRING, defaultValue: null })
  notes: string;

  @Column({ type: DataType.STRING })
  currency_type: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  is_active: boolean;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  create_by: number;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  update_by: number;
}
