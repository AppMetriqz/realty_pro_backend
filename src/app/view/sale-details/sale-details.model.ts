import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  PrimaryKey,
} from 'sequelize-typescript';
import { SaleDetailsAttributes } from './sale-details.dto';
import { ProjectModel } from '../../project/project.model';
import { StageStatus } from '../../../common/constants';
import { UnitModel } from '../../unit/unit.model';
import { ContactModel } from '../../contact/contact.model';

@Table({
  tableName: 'Sale_Details',
  timestamps: false,
  comment: 'VIEW',
  freezeTableName: true,
})
export class SaleDetailsView extends Model<SaleDetailsAttributes> {
  @PrimaryKey
  @Column({ type: DataType.INTEGER })
  sale_id: number;

  @ForeignKey(() => ProjectModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  project_id: number;

  @ForeignKey(() => UnitModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  unit_id: number;

  @ForeignKey(() => ContactModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  client_id: number;

  @ForeignKey(() => ContactModel)
  @Column({ type: DataType.INTEGER, defaultValue: null })
  seller_id: number;

  @Column({ type: DataType.DOUBLE(20, 2), allowNull: false })
  price: number;

  @Column({ type: DataType.FLOAT(2), allowNull: false })
  commission: number;

  @Column({ type: DataType.STRING, defaultValue: null })
  notes: string;

  @Column({ type: DataType.DATEONLY, defaultValue: null })
  financed_at: Date;

  @Column({ type: DataType.DATEONLY, defaultValue: null })
  separated_at: Date;

  @Column({
    type: DataType.ENUM(...StageStatus),
    defaultValue: 'separation',
  })
  stage: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  is_active: boolean;

  @Column({ type: DataType.STRING })
  currency_type: string;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  create_by: number;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  update_by: number;
}
