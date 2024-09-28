import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ContactPaymentPlanView } from './contact-payment-plan.model';

@Module({
  imports: [
    SequelizeModule.forFeature([ContactPaymentPlanView]),
  ],
})
export class ContactPaymentPlanModule {}
