import { Module } from '@nestjs/common';
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
import { SaleModel } from './sale.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProjectPropertyFeaturesModel } from '../project-property-features/project-property-features.model';
import { UnitModel } from '../unit/unit.model';
import { NotificationModel } from '../notification/notification.model';
import { ContactModel } from '../contact/contact.model';
import { PaymentPlanModel } from '../payment-plan/payment-plan.model';
import { PaymentPlanDetailModel } from '../payment-plan-detail/payment-plan-detail.model';
import { SaleClientHistoryModel } from '../sale-client-history/sale-client-history.model';
import { PaymentModel } from '../payment/payment.model';
import { ProjectModel } from '../project/project.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      SaleModel,
      UnitModel,
      ProjectPropertyFeaturesModel,
      NotificationModel,
      ContactModel,
      PaymentPlanModel,
      PaymentPlanDetailModel,
      PaymentModel,
      SaleClientHistoryModel,
      ProjectModel,
    ]),
  ],
  controllers: [SaleController],
  providers: [SaleService],
  exports: [SaleService],
})
export class SaleModule {}
