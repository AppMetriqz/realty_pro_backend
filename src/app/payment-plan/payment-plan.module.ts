import { Module } from '@nestjs/common';
import { PaymentPlanService } from './payment-plan.service';
import { PaymentPlanController } from './payment-plan.controller';
import { PaymentPlanModel } from './payment-plan.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { PaymentPlanDetailModel } from '../payment-plan-detail/payment-plan-detail.model';
import { SaleModel } from '../sale/sale.model';
import { ProjectModel } from '../project/project.model';
import { NotificationModel } from '../notification/notification.model';
import { SaleClientHistoryModel } from '../sale-client-history/sale-client-history.model';
import { ContactModel } from '../contact/contact.model';
import { PaymentModel } from '../payment/payment.model';
import { UnitSalePlanDetailsView } from '../view/unit-sale-plan-details/unit-sale-plan-details.model';
import { CurrentOverduePaymentView } from '../view/current-overdue-payment/current-overdue-payment.model';
import { CurrentPendingPaymentView } from '../view/current-pending-payment/current-pending-payment.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      PaymentPlanModel,
      PaymentPlanDetailModel,
      PaymentModel,
      SaleModel,
      ProjectModel,
      NotificationModel,
      SaleClientHistoryModel,
      ContactModel,
      UnitSalePlanDetailsView,
      CurrentOverduePaymentView,
      CurrentPendingPaymentView,
    ]),
  ],
  controllers: [PaymentPlanController],
  providers: [PaymentPlanService],
  exports: [PaymentPlanService],
})
export class PaymentPlanModule {}
