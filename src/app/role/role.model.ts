import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
} from 'sequelize-typescript';
import { RoleDto } from './role.dto';

@Table({ tableName: 'roles' })
export class RoleModel extends Model<RoleDto> {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  role_id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING })
  description: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  is_active: boolean;
}
