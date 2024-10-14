import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { UnitSalePlanDetailsView } from '../view/unit-sale-plan-details/unit-sale-plan-details.model';
import { SaleDetailsView } from '../view/sale-details/sale-details.model';
import { UnitDetailsView } from '../view/unit-details/unit-details.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      UnitSalePlanDetailsView,
      SaleDetailsView,
      UnitDetailsView,
    ]),
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
