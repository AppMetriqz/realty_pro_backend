import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { PaymentPlanDto } from './payment-plan.dto';
import { SaleModel } from '../sale/sale.model';
import { PaymentPlanDetailModel } from '../payment-plan-detail/payment-plan-detail.model';
import { PaymentPlanDetailDto } from '../payment-plan-detail/payment-plan-detail.dto';
import { ProjectModel } from '../project/project.model';
import { UnitModel } from '../unit/unit.model';
import { PaymentModel } from '../payment/payment.model';
import { PaymentDto } from '../payment/payment.dto';

@Table({ tableName: 'payment_plans', modelName: 'payment_plan' })
export class PaymentPlanModel extends Model<PaymentPlanDto> {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  payment_plan_id: number;

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

  @ForeignKey(() => SaleModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  sale_id: number;
  @BelongsTo(() => SaleModel, 'sale_id')
  sale: SaleModel;

  @Column({
    type: DataType.ENUM('sale', 'resale'),
    defaultValue: 'sale',
  })
  sale_type: string;

  @Column({ type: DataType.DOUBLE(10, 2), allowNull: false })
  total_amount: number;

  @Column({ type: DataType.DOUBLE(10, 2), allowNull: false })
  separation_amount: number;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  separation_date: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  payment_plan_numbers: number;

  @Column({ type: DataType.FLOAT(2), allowNull: false })
  separation_rate: number;

  @Column({
    type: DataType.ENUM('pending', 'resold', 'paid', 'canceled'),
    defaultValue: 'pending',
  })
  status: string;

  @Column({ type: DataType.DATEONLY, defaultValue: null })
  paid_at: string | Date;

  @Column({ type: DataType.STRING, defaultValue: null })
  notes: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  is_active: boolean;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  create_by: number;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  update_by: number;

  @HasMany(() => PaymentPlanDetailModel, {
    onDelete: 'CASCADE',
  })
  payment_plan_details: PaymentPlanDetailDto[];

  @HasMany(() => PaymentModel, {
    onDelete: 'CASCADE',
  })
  payments: PaymentDto[];
}
