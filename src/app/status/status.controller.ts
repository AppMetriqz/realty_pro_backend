import { Controller, Get, UseFilters, Query } from "@nestjs/common";
import { StatusService } from "./status.service";
import { HttpExceptionFilter } from "../../common/exceptions";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Statuses")
@Controller("statuses")
export class StatusController {
  constructor(private readonly service: StatusService) {}

  @Get()
  @UseFilters(new HttpExceptionFilter())
  findAll(
    @Query("pageSize") pageSize: number,
    @Query("pageIndex") pageIndex: number,
  ) {
    return this.service.findAll({ pageSize, pageIndex });
  }
}
