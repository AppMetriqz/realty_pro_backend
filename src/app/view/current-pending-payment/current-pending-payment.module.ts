import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CurrentPendingPaymentView } from './current-pending-payment.model';

@Module({
  imports: [SequelizeModule.forFeature([CurrentPendingPaymentView])],
})
export class CurrentPendingPaymentModule {}
