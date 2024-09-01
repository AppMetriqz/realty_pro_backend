import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  IsEmail,
  ForeignKey,
  BelongsTo,
  HasOne,
  HasMany,
} from 'sequelize-typescript';
import { ContactDto } from './contact.dto';
import { ContactType, MaritalStatuses } from '../../common/constants';
import { SaleModel } from '../sale/sale.model';

@Table({
  tableName: 'contacts',
  indexes: [
    { unique: true, fields: ['email'] },
    { unique: true, fields: ['phone_number_1'] },
    { unique: true, fields: ['national_id'] },
  ],
})
export class ContactModel extends Model<ContactDto> {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  contact_id: number;

  @ForeignKey(() => ContactModel)
  @Column({ type: DataType.INTEGER, defaultValue: null })
  spouse_id: number;
  @BelongsTo(() => ContactModel, 'spouse_id')
  spouse: ContactModel;

  @Column({
    type: DataType.ENUM(...ContactType),
    allowNull: false,
  })
  type: string;

  @Column({ type: DataType.STRING, allowNull: false })
  first_name: string;

  @Column({ type: DataType.STRING, allowNull: true, defaultValue: null })
  last_name: string;

  @IsEmail
  @Column({ type: DataType.STRING, allowNull: true })
  email: string;

  @Column({ type: DataType.STRING, allowNull: true, defaultValue: null })
  phone_number_1: string;

  @Column({ type: DataType.STRING, defaultValue: null })
  phone_number_2: string;

  @Column({ type: DataType.STRING, allowNull: true, defaultValue: null})
  national_id: string;

  @Column({ type: DataType.STRING, allowNull: true, defaultValue: null })
  nationality: string;

  @Column({ type: DataType.STRING, allowNull: true, defaultValue: null })
  contact_method: string;

  @Column({ type: DataType.STRING, defaultValue: null })
  address: string;

  @Column({ type: DataType.STRING, defaultValue: null })
  workplace: string;

  @Column({ type: DataType.STRING, defaultValue: null })
  work_occupation: string;

  @Column({ type: DataType.DATEONLY })
  date_of_birth: Date;

  @Column({ type: DataType.ENUM(...MaritalStatuses), defaultValue: null })
  marital_status: string;

  @Column({ type: DataType.STRING, defaultValue: null })
  notes: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  is_active: boolean;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  create_by: number;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  update_by: number;

  @HasOne(() => ContactModel, 'spouse_id')
  contact_spouse: ContactModel;

  @HasMany(() => SaleModel, 'seller_id')
  seller_sales: SaleModel;

  @HasMany(() => SaleModel, 'client_id')
  client_sales: SaleModel;
}
