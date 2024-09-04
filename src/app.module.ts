import { Module } from '@nestjs/common';
import {
  UserModule,
  RoleModule,
  StatusModule,
  AuthModule,
  ProjectModule,
  PropertyFeaturesModule,
  ProjectPropertyFeaturesModule,
  UnitModule,
  UnitPropertyFeaturesModule,
  ContactModule,
  SaleModule,
  PaymentPlanModule,
  PaymentPlanDetailModule,
  NotificationModule,
  PaymentModule,
  SaleClientHistoryModule,
  FinanceModule,
  DesktopModule,
  LoggerModule,
  UnitSalePlanDetailsModule
} from './app';
import { ConfigurationModule, FileModule, MysqlModule } from './config';

@Module({
  imports: [
    ConfigurationModule,
    MysqlModule,
    FileModule,
    AuthModule,
    UserModule,
    RoleModule,
    StatusModule,
    ProjectModule,
    PropertyFeaturesModule,
    ProjectPropertyFeaturesModule,
    UnitModule,
    UnitPropertyFeaturesModule,
    ContactModule,
    SaleModule,
    PaymentPlanModule,
    PaymentPlanDetailModule,
    NotificationModule,
    PaymentModule,
    SaleClientHistoryModule,
    FinanceModule,
    DesktopModule,
    LoggerModule,
    UnitSalePlanDetailsModule
  ],
})
export class AppModule {}
