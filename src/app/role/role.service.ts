import { Injectable } from '@nestjs/common';
import { RoleModel } from './role.model';
import { InjectModel } from '@nestjs/sequelize';
import { FindAllDto } from './role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(RoleModel) private readonly model: typeof RoleModel,
  ) {}

  async findAll({ pageSize, pageIndex }: FindAllDto) {
    const offset = Number(pageIndex) * Number(pageSize);
    const limit = Number(pageSize);
    return await this.model.findAll({
      limit,
      offset,
      where: {
        is_active: true,
      },
    });
  }
}
