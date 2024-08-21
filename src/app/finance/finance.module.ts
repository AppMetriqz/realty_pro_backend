import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { PaymentPlanDetailModel } from '../payment-plan-detail/payment-plan-detail.model';
import { PaymentPlanModel } from '../payment-plan/payment-plan.model';
import { UnitModel } from '../unit/unit.model';
import { SaleModel } from '../sale/sale.model';
import { ProjectModel } from '../project/project.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ProjectModel,
      PaymentPlanModel,
      PaymentPlanDetailModel,
      UnitModel,
      SaleModel,
    ]),
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
