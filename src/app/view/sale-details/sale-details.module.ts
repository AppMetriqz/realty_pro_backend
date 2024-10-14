import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SaleDetailsView } from './sale-details.model';

@Module({
  imports: [SequelizeModule.forFeature([SaleDetailsView])],
})
export class SaleDetailsModule {}
