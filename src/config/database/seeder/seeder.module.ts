import { Module } from '@nestjs/common';
import { MysqlModule } from '../mysql/mysql.module';
import { ConfigurationModule } from '../../configuration/configuration.module';
import { SeederService } from './seeder.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { RoleModel } from '../../../app/role/role.model';
import { StatusModel } from '../../../app/status/status.model';
import { UserModel } from '../../../app/user/user.model';
import { PropertyFeaturesModel } from '../../../app/property-features/property-features.model';

@Module({
  imports: [
    ConfigurationModule,
    MysqlModule,
    SequelizeModule.forFeature([
      RoleModel,
      StatusModel,
      UserModel,
      PropertyFeaturesModel,
    ]),
  ],
  providers: [SeederService],
})
export class SeederModule {}
