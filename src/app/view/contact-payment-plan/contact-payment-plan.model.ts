import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  PrimaryKey,
  HasMany,
  BelongsTo,
} from 'sequelize-typescript';
import { ContactPaymentPlanViewDto } from './contact-payment-plan.dto';
import { ProjectModel } from '../../project/project.model';
import { UnitModel } from '../../unit/unit.model';
import { SaleModel } from '../../sale/sale.model';
import { PaymentPlanDetailModel } from '../../payment-plan-detail/payment-plan-detail.model';
import { PaymentPlanDetailDto } from '../../payment-plan-detail/payment-plan-detail.dto';
import { PaymentModel } from '../../payment/payment.model';
import { PaymentDto } from '../../payment/payment.dto';
import { ContactModel } from '../../contact/contact.model';

@Table({
  tableName: 'Contact_Payment_Plan',
  timestamps: false,
  comment: 'VIEW',
  freezeTableName: true,
})
export class ContactPaymentPlanView extends Model<ContactPaymentPlanViewDto> {
  @PrimaryKey
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

  @ForeignKey(() => ContactModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  current_client_id: number;

  @ForeignKey(() => ContactModel)
  @Column({ type: DataType.STRING, allowNull: false })
  client_ids: string;

  @Column({
    type: DataType.ENUM('sale', 'resale'),
    defaultValue: 'sale',
  })
  sale_type: string;

  @Column({ type: DataType.DOUBLE(20, 2), allowNull: false })
  total_amount: number;

  @Column({ type: DataType.DOUBLE(20, 2), allowNull: false })
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

  @Column({ type: DataType.DOUBLE(20, 2), allowNull: false })
  total_payment_amount: number;

  @Column({ type: DataType.DOUBLE(20, 2), allowNull: false })
  total_amount_paid: number;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  create_by: number;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  update_by: number;

  @Column({ type: DataType.DATE, defaultValue: null })
  created_at: Date;

  @Column({ type: DataType.DATE, defaultValue: null })
  updated_at: Date;

  @HasMany(() => PaymentPlanDetailModel, {
    foreignKey: 'payment_plan_id',
    sourceKey: 'payment_plan_id',
    onDelete: 'CASCADE',
  })
  payment_plan_details: PaymentPlanDetailDto[];

  @HasMany(() => PaymentModel, {
    foreignKey: 'payment_plan_id',
    sourceKey: 'payment_plan_id',
    onDelete: 'CASCADE',
  })
  payments: PaymentDto[];
}
