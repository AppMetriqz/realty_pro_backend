import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UnitSalePlanDetailsView } from './unit-sale-plan-details.model';

@Module({
  imports: [SequelizeModule.forFeature([UnitSalePlanDetailsView])],
})
export class UnitSalePlanDetailsModule {}
