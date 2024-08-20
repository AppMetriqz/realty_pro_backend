import { Module } from '@nestjs/common';
import { UnitPropertyFeaturesModel } from './unit-property-features.model';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([UnitPropertyFeaturesModel])],
})
export class UnitPropertyFeaturesModule {}
