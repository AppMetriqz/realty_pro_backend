import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UnitDetailsView } from './unit-details.model';

@Module({
  imports: [SequelizeModule.forFeature([UnitDetailsView])],
})
export class UnitDetailsModule {}
