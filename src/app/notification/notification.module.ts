import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationModel } from './notification.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProjectPropertyFeaturesModel } from '../project-property-features/project-property-features.model';

@Module({
  imports: [
    SequelizeModule.forFeature([NotificationModel, ProjectPropertyFeaturesModel]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
