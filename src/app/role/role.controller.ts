import { Controller, Get, UseFilters, Query } from "@nestjs/common";
import { RoleService } from "./role.service";

import { HttpExceptionFilter } from "../../common/exceptions";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Roles")
@Controller("roles")
export class RoleController {
  constructor(private readonly service: RoleService) {}

  @Get()
  @UseFilters(new HttpExceptionFilter())
  findAll(
    @Query("pageSize") pageSize: number,
    @Query("pageIndex") pageIndex: number,
  ) {
    return this.service.findAll({ pageSize, pageIndex });
  }
}
