import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { ContactModel } from './contact.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProjectPropertyFeaturesModel } from '../project-property-features/project-property-features.model';
import { PaymentPlanModel } from '../payment-plan/payment-plan.model';
import { PaymentPlanDetailModel } from '../payment-plan-detail/payment-plan-detail.model';
import { SaleModel } from '../sale/sale.model';
import { ContactPaymentPlanView } from '../view/contact-payment-plan/contact-payment-plan.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ContactModel,
      ProjectPropertyFeaturesModel,
      SaleModel,
      PaymentPlanModel,
      PaymentPlanDetailModel,
      ContactPaymentPlanView,
    ]),
  ],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
