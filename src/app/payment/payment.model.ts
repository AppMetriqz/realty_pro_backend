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
import { PaymentDto } from './payment.dto';
import { PaymentPlanModel } from '../payment-plan/payment-plan.model';
import { ProjectModel } from '../project/project.model';
import { UnitModel } from '../unit/unit.model';
import { SaleModel } from '../sale/sale.model';

@Table({ tableName: 'payments' })
export class PaymentModel extends Model<PaymentDto> {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  payment_id: number;

  @ForeignKey(() => PaymentPlanModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  payment_plan_id: number;
  @BelongsTo(() => PaymentPlanModel, 'payment_plan_id')
  payment_plan: PaymentPlanModel;

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

  @Column({ type: DataType.DOUBLE(10, 2), allowNull: false })
  amount: number;

  @Column({ type: DataType.DATEONLY, defaultValue: null })
  payment_made_at: Date;

  @Column({
    type: DataType.ENUM('completed', 'refunded', 'canceled'),
    defaultValue: 'completed',
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
