import { Injectable } from '@nestjs/common';
import { PropertyFeaturesModel } from './property-features.model';
import { InjectModel } from '@nestjs/sequelize';
import { CurrentUserDto } from '../../common/dto';
import { StatusCodes } from '../../common/constants';
import {
  FindAllDto,
  CreateDto,
  UpdateDto,
} from './property-features.dto';
import * as _ from 'lodash';
import { Op } from 'sequelize';

@Injectable()
export class PropertyFeaturesService {
  constructor(
    @InjectModel(PropertyFeaturesModel)
    private readonly model: typeof PropertyFeaturesModel,
  ) {}

  async findAll(filters: FindAllDto) {
    const offset = _.toNumber(filters.pageIndex) * _.toNumber(filters.pageSize);
    const limit = _.toNumber(filters.pageSize);
    const sort_order = filters.sortOrder;
    const sort_by = filters.sortBy;
    const dateFrom = filters.dateFrom;
    const dateTo = filters.dateTo;
    const type = filters.type;

    let order = undefined;
    const where: { created_at?: any; type?: any } = {};

    if (_.size(sort_order) > 0 && _.size(sort_by) > 0) {
      order = [[sort_by, sort_order]];
    }

    if (_.size(dateFrom) > 0 && _.size(dateTo) > 0) {
      where.created_at = { [Op.between]: [dateFrom, dateTo] };
    }

    if (_.size(type) > 0) {
      where.type = { [Op.in]: ['all', type] };
    }

    return await this.model.findAndCountAll({
      limit,
      offset,
      order,
      where: { ...where },
    });
  }

  async findOne({ id }: { id: number }) {
    const model = await this.model.findByPk(id);
    if (!model) {
      return {
        statusCode: StatusCodes.NotFound.statusCode,
        error: StatusCodes.NotFound.error,
        message: StatusCodes.NotFound.message,
      };
    }
    return model;
  }

  async create({
    body,
    currentUser,
  }: {
    body: CreateDto;
    currentUser: CurrentUserDto;
  }) {
    body.create_by = currentUser.user_id;
    return await this.model.create(body);
  }

  async update({
    id,
    body,
    currentUser,
  }: {
    id: number;
    body: UpdateDto;
    currentUser: CurrentUserDto;
  }) {
    const model = await this.model.findByPk(id);
    if (!model) {
      return {
        statusCode: StatusCodes.NotFound.statusCode,
        error: StatusCodes.NotFound.error,
        message: StatusCodes.NotFound.message,
      };
    }
    body.update_by = currentUser.user_id;
    return model.update(body);
  }

  async remove({
    id,
    currentUser,
  }: {
    id: number;
    currentUser: CurrentUserDto;
  }) {
    const model = await this.model.findByPk(id);
    if (!model) {
      return {
        statusCode: StatusCodes.NotFound.statusCode,
        error: StatusCodes.NotFound.error,
        message: StatusCodes.NotFound.message,
      };
    }
    await model.update({ is_active: false, update_by: currentUser.user_id });
    return { message: 'deleted' };
  }
}
