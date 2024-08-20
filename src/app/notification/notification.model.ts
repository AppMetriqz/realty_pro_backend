import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
} from 'sequelize-typescript';
import { NotificationDto } from './notification.dto';
import { NotificationType } from '../../common/constants';

@Table({ tableName: 'notifications' })
export class NotificationModel extends Model<NotificationDto> {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER })
  notification_id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, defaultValue: null })
  description: string;

  @Column({
    type: DataType.ENUM(...NotificationType),
    allowNull: false,
  })
  notification_type: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  notification_type_id: number;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  notification_date: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: null })
  isNotes: boolean;

  @Column({
    type: DataType.ENUM('pending', 'read', 'completed'),
    defaultValue: 'pending',
  })
  status: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  is_active: boolean;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  create_by: number;

  @Column({ type: DataType.INTEGER, defaultValue: null })
  update_by: number;
}
