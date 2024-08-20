import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LoggerModel } from './logger.model';

@Module({
  imports: [SequelizeModule.forFeature([LoggerModel])],
})
export class LoggerModule {}
