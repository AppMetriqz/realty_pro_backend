import { Module } from '@nestjs/common';
import { DesktopService } from './desktop.service';
import { DesktopController } from './desktop.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { SaleModel } from '../sale/sale.model';
import { UnitModel } from '../unit/unit.model';
import { UserModel } from '../user/user.model';

@Module({
  imports: [SequelizeModule.forFeature([SaleModel, UnitModel, UserModel])],
  controllers: [DesktopController],
  providers: [DesktopService],
  exports: [DesktopService],
})
export class DesktopModule {}
