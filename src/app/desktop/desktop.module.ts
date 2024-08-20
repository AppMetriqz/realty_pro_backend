import { Module } from '@nestjs/common';
import { DesktopService } from './desktop.service';
import { DesktopController } from './desktop.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { SaleModel } from '../sale/sale.model';
import { UnitModel } from '../unit/unit.model';

@Module({
  imports: [SequelizeModule.forFeature([SaleModel, UnitModel])],
  controllers: [DesktopController],
  providers: [DesktopService],
  exports: [DesktopService],
})
export class DesktopModule {}
