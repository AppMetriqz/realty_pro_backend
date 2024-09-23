import './instrument';
import { SentryModule } from '@sentry/nestjs/setup';
import { APP_FILTER } from '@nestjs/core';
import { SentryGlobalFilter } from '@sentry/nestjs/setup';
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
  UnitSalePlanDetailsModule,
  CurrentPaymentPendingModule,
} from './app';
import {
  ConfigurationModule,
  FileModule,
  MysqlModule,
  CloudinaryClientModule,
} from './config';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigurationModule,
    MysqlModule,
    FileModule,
    CloudinaryClientModule,
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
    UnitSalePlanDetailsModule,
    CurrentPaymentPendingModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
  ],
})
export class AppModule {}
