import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { RoleModel } from './role.model';

@Module({
  imports: [SequelizeModule.forFeature([RoleModel])],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
