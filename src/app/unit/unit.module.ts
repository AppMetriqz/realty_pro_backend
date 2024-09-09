import { forwardRef, Module } from '@nestjs/common';
import { UnitService } from './unit.service';
import { UnitController } from './unit.controller';
import { UnitModel } from './unit.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { UnitPropertyFeaturesModel } from '../unit-property-features/unit-property-features.model';
import { ProjectModel } from '../project/project.model';
import { SaleModel } from '../sale/sale.model';
import { PaymentPlanModel } from '../payment-plan/payment-plan.model';
import { PaymentModel } from '../payment/payment.model';
import { PaymentPlanDetailModel } from '../payment-plan-detail/payment-plan-detail.model';
import { NotificationModel } from '../notification/notification.model';
import { SaleClientHistoryModel } from '../sale-client-history/sale-client-history.model';
import { ContactModel } from '../contact/contact.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      UnitModel,
      UnitPropertyFeaturesModel,
      ProjectModel,
      SaleModel,
      PaymentPlanModel,
      PaymentModel,
      PaymentPlanDetailModel,
      NotificationModel,
      SaleClientHistoryModel,
      ContactModel,
    ]),
  ],
  controllers: [UnitController],
  providers: [UnitService],
  exports: [UnitService],
})
export class UnitModule {}
