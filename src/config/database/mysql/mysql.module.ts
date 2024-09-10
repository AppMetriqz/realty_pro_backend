import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { UnitModel } from '../../../app/unit/unit.model';
import { ContactModel } from '../../../app/contact/contact.model';
import { ProjectModel } from '../../../app/project/project.model';
import { SaleModel } from '../../../app/sale/sale.model';
import { PaymentModel } from '../../../app/payment/payment.model';
import { PaymentPlanModel } from '../../../app/payment-plan/payment-plan.model';
import { PaymentPlanDetailModel } from '../../../app/payment-plan-detail/payment-plan-detail.model';
import { StatusModel } from '../../../app/status/status.model';
import { UserModel } from '../../../app/user/user.model';
import { UnitPropertyFeaturesModel } from '../../../app/unit-property-features/unit-property-features.model';
import { PropertyFeaturesModel } from '../../../app/property-features/property-features.model';
import { ProjectPropertyFeaturesModel } from '../../../app/project-property-features/project-property-features.model';
import { NotificationModel } from '../../../app/notification/notification.model';
import { LoggerModel } from '../../../app/logger/logger.model';
import { RoleModel } from '../../../app/role/role.model';
import { SaleClientHistoryModel } from '../../../app/sale-client-history/sale-client-history.model';

@Global()
@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: 'mysql',
        host: configService.get('DATABASE_HOST'),
        port: +configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        autoLoadModels: false,
        synchronize: true,
        logging: false,
        define: {
          createdAt: 'created_at',
          updatedAt: 'updated_at',
          deletedAt: 'deleted_at',
          freezeTableName: true,
          paranoid: false,
        },
        models: [
          ContactModel,
          UnitModel,
          ProjectModel,
          SaleModel,
          PaymentModel,
          PaymentPlanModel,
          PaymentPlanDetailModel,
          StatusModel,
          UserModel,
          ProjectPropertyFeaturesModel,
          PropertyFeaturesModel,
          UnitPropertyFeaturesModel,
          NotificationModel,
          LoggerModel,
          RoleModel,
          SaleClientHistoryModel,
        ],
      }),
      inject: [ConfigService],
    }),
  ],
})
export class MysqlModule {}
