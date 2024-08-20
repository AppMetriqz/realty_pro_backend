import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { ProjectModel } from './project.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProjectPropertyFeaturesModel } from '../project-property-features/project-property-features.model';
import { PaymentPlanDetailModel } from '../payment-plan-detail/payment-plan-detail.model';
import { UnitModel } from '../unit/unit.model';
import { SaleModel } from '../sale/sale.model';
import { PaymentPlanModel } from '../payment-plan/payment-plan.model';
import { PaymentModel } from '../payment/payment.model';
import { NotificationModel } from '../notification/notification.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ProjectModel,
      ProjectPropertyFeaturesModel,
      PaymentPlanDetailModel,
      PaymentPlanModel,
      UnitModel,
      SaleModel,
      PaymentModel,
      NotificationModel,
    ]),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
