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
import { SaleClientHistoryDto } from './sale-client-history.dto';
import { ContactModel } from '../contact/contact.model';
import { SaleModel } from '../sale/sale.model';

@Table({
  tableName: 'sale_client_history',
  indexes: [{ unique: true, fields: ['sale_id', 'client_id'] }],
})
export class SaleClientHistoryModel extends Model<SaleClientHistoryDto> {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  sale_history_id: number;

  @ForeignKey(() => SaleModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  sale_id: number;
  @BelongsTo(() => SaleModel, 'sale_id')
  sale: SaleModel;

  @ForeignKey(() => ContactModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  client_id: number;
  @BelongsTo(() => ContactModel, 'client_id')
  client: ContactModel;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  total_amount: number;

  @Column({
    type: DataType.ENUM('sale', 'resale'),
    defaultValue: 'sale',
  })
  sale_type: string;

  @Column({ type: DataType.STRING, defaultValue: null })
  notes: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  is_active: boolean;
}
