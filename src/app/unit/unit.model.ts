import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  HasMany,
  ForeignKey,
  BelongsTo,
  HasOne,
} from 'sequelize-typescript';
import { UnitDto } from './unit.dto';
import { PropertyType, UnitStatus } from '../../common/constants';
import { UnitPropertyFeaturesModel } from '../unit-property-features/unit-property-features.model';
import { ProjectModel } from '../project/project.model';
import { SaleModel } from '../sale/sale.model';
import { SaleDto } from '../sale/sale.dto';
import { PaymentPlanModel } from '../payment-plan/payment-plan.model';
import { PaymentPlanDto } from '../payment-plan/payment-plan.dto';
import { UnitPropertyFeaturesDto } from '../unit-property-features/unit-property-features.dto';

@Table({ tableName: 'units', modelName: 'unit' })
export class UnitModel extends Model<UnitDto> {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  unit_id: number;

  @ForeignKey(() => ProjectModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  project_id: number;
  @BelongsTo(() => ProjectModel, 'project_id')
  project: ProjectModel;

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

  @Column({ type: DataType.BLOB({ length: 'long' }), defaultValue: null })
  cover: Buffer;

  @Column({ type: DataType.STRING, defaultValue: null })
  cover_mimetype: string;

  @Column({ type: DataType.STRING, defaultValue: null })
  notes: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  is_active: boolean;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  create_by: number;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  update_by: number;

  @HasMany(() => UnitPropertyFeaturesModel)
  unit_property_feature: UnitPropertyFeaturesDto[];

  @HasOne(() => SaleModel)
  sale: SaleDto;

  @HasMany(() => PaymentPlanModel)
  payment_plan: PaymentPlanDto[];
}
