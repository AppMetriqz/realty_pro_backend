import { Module } from '@nestjs/common';
import { ProjectPropertyFeaturesModel } from './project-property-features.model';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([ProjectPropertyFeaturesModel])],
})
export class ProjectPropertyFeaturesModule {}
