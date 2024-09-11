import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CurrentOverduePaymentView } from './current-overdue-payment.model';

@Module({
  imports: [SequelizeModule.forFeature([CurrentOverduePaymentView])],
})
export class CurrentOverduePaymentModule {}
