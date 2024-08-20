import { Module } from "@nestjs/common";
import { StatusService } from "./status.service";
import { StatusController } from "./status.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { StatusModel } from "./status.model";

@Module({
  imports: [SequelizeModule.forFeature([StatusModel])],
  controllers: [StatusController],
  providers: [StatusService],
})
export class StatusModule {}
