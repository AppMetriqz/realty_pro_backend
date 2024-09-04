import {
  Model,
  Table,
  Column,
  DataType,
  Index,
  Sequelize,
  ForeignKey,
} from 'sequelize-typescript';

export interface unitSalePlanDetailsAttributes {
  projectId: number;
  unitId?: number;
  saleId?: number;
  paymentPlanId?: number;
  stage?: string;
  paymentStatus?: string;
  amount: number;
  paymentSeparation?: number;
  totalPaidAmount?: string;
  totalPaidAmountSeparation?: number;
  totalDueAmount?: string;
  totalPendingAmount?: string;
  totalAdditionalAmount?: string;
}

@Table({
  tableName: 'Unit_Sale_Plan_Details',
  timestamps: false,
  comment: 'VIEW',
})
export class unitSalePlanDetails
  extends Model<unitSalePlanDetailsAttributes, unitSalePlanDetailsAttributes>
  implements unitSalePlanDetailsAttributes
{
  @Column({ field: 'project_id', type: DataType.INTEGER })
  projectId!: number;

  @Column({ field: 'unit_id', type: DataType.INTEGER, defaultValue: '0' })
  unitId?: number;

  @Column({ field: 'sale_id', allowNull: true, type: DataType.BIGINT })
  saleId?: number;

  @Column({ field: 'payment_plan_id', allowNull: true, type: DataType.BIGINT })
  paymentPlanId?: number;

  @Column({ allowNull: true, type: DataType.STRING(24) })
  stage?: string;

  @Column({
    field: 'payment_status',
    allowNull: true,
    type: DataType.STRING(8),
  })
  paymentStatus?: string;

  @Column({ type: DataType.DOUBLE(10, 2) })
  amount!: number;

  @Column({
    field: 'payment_separation',
    type: DataType.DOUBLE(22, 2),
    defaultValue: '0.00',
  })
  paymentSeparation?: number;

  @Column({
    field: 'total_paid_amount',
    type: DataType.DECIMAL(32, 2),
    defaultValue: '0.00',
  })
  totalPaidAmount?: string;

  @Column({
    field: 'total_paid_amount_separation',
    type: DataType.DOUBLE(22, 2),
    defaultValue: '0.00',
  })
  totalPaidAmountSeparation?: number;

  @Column({
    field: 'total_due_amount',
    type: DataType.DECIMAL(32, 2),
    defaultValue: '0.00',
  })
  totalDueAmount?: string;

  @Column({
    field: 'total_pending_amount',
    type: DataType.DECIMAL(33, 2),
    defaultValue: '0.00',
  })
  totalPendingAmount?: string;

  @Column({
    field: 'total_additional_amount',
    type: DataType.DECIMAL(33, 2),
    defaultValue: '0.00',
  })
  totalAdditionalAmount?: string;
}
