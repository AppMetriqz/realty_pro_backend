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
import { SaleDto } from './sale.dto';
import { ContactModel } from '../contact/contact.model';
import { ProjectModel } from '../project/project.model';
import { UnitModel } from '../unit/unit.model';
import { SaleClientHistoryModel } from '../sale-client-history/sale-client-history.model';
import { SaleClientHistoryDto } from '../sale-client-history/sale-client-history.dto';
import { StageStatus } from '../../common/constants';

@Table({
  tableName: 'sales',
})
export class SaleModel extends Model<SaleDto> {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  sale_id: number;

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

  @ForeignKey(() => ContactModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  client_id: number;
  @BelongsTo(() => ContactModel, 'client_id')
  client: ContactModel;

  @ForeignKey(() => ContactModel)
  @Column({ type: DataType.INTEGER, defaultValue: null })
  seller_id: number;
  @BelongsTo(() => ContactModel, 'seller_id')
  seller: ContactModel;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  price: number;

  @Column({ type: DataType.FLOAT(2), allowNull: false })
  commission: number;

  @Column({ type: DataType.STRING, defaultValue: null })
  notes: string;

  @Column({
    type: DataType.ENUM(...StageStatus),
    defaultValue: 'separation',
  })
  stage: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  is_active: boolean;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  create_by: number;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  update_by: number;

  @HasMany(() => SaleClientHistoryModel, {
    onDelete: 'CASCADE',
  })
  sale_client_history: SaleClientHistoryDto[];
}
