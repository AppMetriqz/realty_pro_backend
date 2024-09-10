import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
} from 'sequelize-typescript';
import { StatusDto } from './status.dto';

@Table({ tableName: 'statuses' })
export class StatusModel extends Model<StatusDto> {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  status_id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING })
  description: string;
}
