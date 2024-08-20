import { Module } from '@nestjs/common';
import { PaymentPlanDetailModel } from './payment-plan-detail.model';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([PaymentPlanDetailModel])],
})
export class PaymentPlanDetailModule {}
