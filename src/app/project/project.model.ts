import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  HasMany,
} from 'sequelize-typescript';
import { ProjectDto } from './project.dto';
import { CurrencyType, PropertyType } from '../../common/constants';
import { ProjectPropertyFeaturesModel } from '../project-property-features/project-property-features.model';
import { UnitModel } from '../unit/unit.model';
import { UnitDto } from '../unit/unit.dto';
import { SaleModel } from '../sale/sale.model';
import { SaleDto } from '../sale/sale.dto';
import { PaymentPlanDetailModel } from '../payment-plan-detail/payment-plan-detail.model';
import { PaymentPlanDetailDto } from '../payment-plan-detail/payment-plan-detail.dto';
import { PaymentPlanModel } from '../payment-plan/payment-plan.model';
import { PaymentPlanDto } from '../payment-plan/payment-plan.dto';
import { ProjectPropertyFeaturesDto } from '../project-property-features/project-property-features.dto';

@Table({ tableName: 'projects', modelName: 'project' })
export class ProjectModel extends Model<ProjectDto> {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  project_id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, defaultValue: null })
  description: string;

  @Column({ type: DataType.STRING, defaultValue: false })
  notes: string;

  @Column({
    type: DataType.ENUM(...PropertyType),
    allowNull: false,
  })
  type: string;

  @Column({
    type: DataType.ENUM(...CurrencyType),
    defaultValue: CurrencyType[0],
  })
  currency_type: string;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  levels_qty: string;

  @Column({ type: DataType.STRING, allowNull: false })
  country_code: string;

  @Column({ type: DataType.STRING, allowNull: false })
  state: string;

  @Column({ type: DataType.STRING, allowNull: false })
  city: string;

  @Column({ type: DataType.STRING, allowNull: false })
  sector: string;

  @Column({ type: DataType.STRING, allowNull: false })
  address: string;

  @Column({ type: DataType.FLOAT, defaultValue: null })
  latitude: number;

  @Column({ type: DataType.FLOAT, defaultValue: null })
  longitude: number;

  @Column({ type: DataType.STRING, defaultValue: null })
  cover_name: string;

  @Column({ type: DataType.STRING, defaultValue: null })
  cover_path: string;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  cover_size: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  is_active: boolean;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  create_by: number;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  update_by: number;

  // @Column({ type: DataType.DATE })
  // created_at: Date;

  @HasMany(() => ProjectPropertyFeaturesModel)
  project_property_feature: ProjectPropertyFeaturesDto[];

  @HasMany(() => UnitModel)
  units: UnitDto[];

  @HasMany(() => SaleModel)
  sales: SaleDto[];

  @HasMany(() => PaymentPlanModel)
  payment_plan: PaymentPlanDto[];

  @HasMany(() => PaymentPlanDetailModel)
  payment_plan_detail: PaymentPlanDetailDto[];
}
