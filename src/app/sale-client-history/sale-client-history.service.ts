import { Injectable } from '@nestjs/common';
import { SaleClientHistoryModel } from './sale-client-history.model';
import { InjectModel } from '@nestjs/sequelize';
import { FindAllDto } from './sale-client-history.dto';
import * as _ from 'lodash';
import { Op } from 'sequelize';

@Injectable()
export class SaleClientHistoryService {
  constructor(
    @InjectModel(SaleClientHistoryModel)
    private readonly model: typeof SaleClientHistoryModel,
  ) {}

  async findAll(filters: FindAllDto) {
    const offset = _.toNumber(filters.pageIndex) * _.toNumber(filters.pageSize);
    const limit = _.toNumber(filters.pageSize);
    const sort_order = filters.sortOrder;
    const sort_by = filters.sortBy;
    const dateFrom = filters.dateFrom;
    const dateTo = filters.dateTo;

    let order = undefined;
    const where: { created_at?: any } = {};

    if (_.size(sort_order) > 0 && _.size(sort_by) > 0) {
      order = [[sort_by, sort_order]];
    }

    if (_.size(dateFrom) > 0 && _.size(dateTo) > 0) {
      where.created_at = { [Op.between]: [dateFrom, dateTo] };
    }

    return await this.model.findAndCountAll({
      limit,
      offset,
      order,
      where: { ...where },
    });
  }
}
