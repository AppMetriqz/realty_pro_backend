import { Module } from '@nestjs/common';
import { SaleClientHistoryService } from './sale-client-history.service';
import { SaleClientHistoryController } from './sale-client-history.controller';
import { SaleClientHistoryModel } from './sale-client-history.model';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([SaleClientHistoryModel])],
  controllers: [SaleClientHistoryController],
  providers: [SaleClientHistoryService],
  exports: [SaleClientHistoryService],
})
export class SaleClientHistoryModule {}
