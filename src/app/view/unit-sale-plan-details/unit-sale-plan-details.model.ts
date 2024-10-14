import { Model, Table, Column, DataType } from 'sequelize-typescript';
import { UnitSalePlanDetailsAttributes } from './unit-sale-plan-details.dto';

@Table({
  tableName: 'Unit_Sale_Plan_Details',
  timestamps: false,
  comment: 'VIEW',
  freezeTableName: true,
})
export class UnitSalePlanDetailsView extends Model<UnitSalePlanDetailsAttributes> {
  @Column({ type: DataType.INTEGER })
  project_id: number;

  @Column({ type: DataType.INTEGER, defaultValue: '0' })
  unit_id: number;

  @Column({ allowNull: true, type: DataType.BIGINT })
  sale_id: number;

  @Column({ allowNull: true, type: DataType.BOOLEAN })
  sale_is_active: boolean;

  @Column({ allowNull: true, type: DataType.BIGINT })
  payment_plan_id: number;

  @Column({ allowNull: true, type: DataType.STRING(24) })
  unit_status: string;

  @Column({ allowNull: true, type: DataType.STRING(24) })
  stage: string;

  @Column({ allowNull: true, type: DataType.STRING(8) })
  payment_status: string;

  @Column({ type: DataType.DOUBLE(10, 2) })
  amount: number;

  @Column({ type: DataType.STRING })
  currency_type: string;

  @Column({ type: DataType.DOUBLE(22, 2) })
  payment_separation: number;

  @Column({ type: DataType.DECIMAL(32, 2) })
  total_paid_amount: number;

  @Column({ type: DataType.DOUBLE(22, 2) })
  total_paid_amount_separation: number;

  @Column({ type: DataType.DECIMAL(32, 2) })
  total_due_amount: number;

  @Column({ type: DataType.DECIMAL(33, 2) })
  total_pending_amount: number;

  @Column({ type: DataType.DECIMAL(33, 2) })
  total_additional_amount: number;

  @Column({ type: DataType.DECIMAL(33, 2) })
  stat_payment_financing: number;

  @Column({ type: DataType.DECIMAL(33, 2) })
  stat_payment_received: number;

  @Column({ type: DataType.DECIMAL(33, 2) })
  stat_payment_pending: number;
}
