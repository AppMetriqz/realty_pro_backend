import { Module } from '@nestjs/common';
import { PropertyFeaturesService } from './property-features.service';
import { PropertyFeaturesController } from './property-features.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { PropertyFeaturesModel } from './property-features.model';

@Module({
  imports: [SequelizeModule.forFeature([PropertyFeaturesModel])],
  controllers: [PropertyFeaturesController],
  providers: [PropertyFeaturesService],
})
export class PropertyFeaturesModule {}
