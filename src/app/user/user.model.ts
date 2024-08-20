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
} from 'sequelize-typescript';
import { UserDto } from './user.dto';
import { RoleModel } from '../role/role.model';
import { StatusModel } from '../status/status.model';

@Table({
  tableName: 'users',
  indexes: [
    { unique: true, fields: ['phone_number'] },
    { unique: true, fields: ['email'] },
    { unique: true, fields: ['national_id'] },
  ],
})
export class UserModel extends Model<UserDto> {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  user_id: number;

  @ForeignKey(() => RoleModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  role_id: number;
  @BelongsTo(() => RoleModel, 'role_id')
  role: RoleModel;

  @ForeignKey(() => StatusModel)
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  status_id: number;
  @BelongsTo(() => StatusModel, 'status_id')
  status: StatusModel;

  @Column({ type: DataType.STRING, allowNull: false })
  first_name: string;

  @Column({ type: DataType.STRING, allowNull: false })
  last_name: string;

  @Column({ type: DataType.STRING })
  phone_number: string;

  @Column({ type: DataType.STRING, allowNull: false })
  national_id: string;

  @IsEmail
  @Column({ type: DataType.STRING, allowNull: false })
  email: string;

  @Column({ type: DataType.STRING })
  password: string;

  @Column({ type: DataType.STRING, defaultValue: null })
  notes: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  is_active: boolean;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  create_by: number;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  update_by: number;
}
