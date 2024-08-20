import { Injectable } from '@nestjs/common';
import { StatusModel } from './status.model';
import { InjectModel } from '@nestjs/sequelize';
import { FindAllDto } from './status.dto';

@Injectable()
export class StatusService {
  constructor(
    @InjectModel(StatusModel) private readonly model: typeof StatusModel,
  ) {}

  async findAll({ pageSize, pageIndex }: FindAllDto) {
    const offset = Number(pageIndex) * Number(pageSize);
    const limit = Number(pageSize);
    return await this.model.findAll({ limit, offset });
  }
}
