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
import { PaymentPlanDetailDto } from './payment-plan-detail.dto';
import { PaymentPlanModel } from '../payment-plan/payment-plan.model';
import { ProjectModel } from '../project/project.model';
import { UnitModel } from '../unit/unit.model';
import { SaleModel } from '../sale/sale.model';

@Table({
  tableName: 'payment_plan_details',
  indexes: [{ unique: true, fields: ['payment_plan_id', 'payment_number'] }],
})
export class PaymentPlanDetailModel extends Model<PaymentPlanDetailDto> {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  payment_plan_detail_id: number;

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

  @ForeignKey(() => PaymentPlanModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  payment_plan_id: number;
  @BelongsTo(() => PaymentPlanModel, 'payment_plan_id')
  payment_plan: PaymentPlanModel;

  @Column({
    type: DataType.ENUM('sale', 'resale'),
    defaultValue: 'sale',
  })
  sale_type: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  payment_amount: number;

  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
  amount_paid: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  payment_number: number;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  payment_date: string;

  @Column({ type: DataType.DATE, defaultValue: null })
  paid_at: Date;

  @Column({ type: DataType.DATE, defaultValue: null })
  payment_made_at: Date;

  @Column({
    type: DataType.ENUM('pending', 'paid', 'resold', 'canceled'),
    defaultValue: 'pending',
  })
  status: string;

  @Column({ type: DataType.STRING, defaultValue: null })
  notes: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  is_active: boolean;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  create_by: number;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  update_by: number;
}
