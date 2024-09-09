import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CurrentPaymentPendingView } from './current-payment-pending.model';

@Module({
  imports: [
    SequelizeModule.forFeature([CurrentPaymentPendingView]),
  ],
})
export class CurrentPaymentPendingModule {}
