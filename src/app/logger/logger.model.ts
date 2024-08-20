import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
} from 'sequelize-typescript';

interface LoggerDto {
  id?: number;
  ref_id: number;
  name: string;
  values: string;
}

@Table({ tableName: 'logger' })
export class LoggerModel extends Model<LoggerDto> {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  id: number;

  @Column({ type: DataType.INTEGER })
  ref_id: number;

  @Column({ type: DataType.STRING })
  name: string;

  @Column({ type: DataType.TEXT })
  values: string;
}
