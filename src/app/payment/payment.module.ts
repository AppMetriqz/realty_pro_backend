import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentModel } from './payment.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { PaymentPlanDetailModel } from '../payment-plan-detail/payment-plan-detail.model';
import { PaymentPlanModel } from '../payment-plan/payment-plan.model';
import { SaleModel } from '../sale/sale.model';
import { LoggerModel } from '../logger/logger.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      PaymentModel,
      PaymentPlanModel,
      PaymentPlanDetailModel,
      SaleModel,
      LoggerModel,
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
