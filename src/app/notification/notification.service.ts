import { Injectable } from '@nestjs/common';
import { NotificationModel } from './notification.model';
import { InjectModel } from '@nestjs/sequelize';
import {
  CreateDto,
  DeleteDto,
  FindAllDto,
  UpdateDto,
} from './notification.dto';
import * as _ from 'lodash';
import { Op } from 'sequelize';
import { StatusCodes } from '../../common/constants';
import { CurrentUserDto } from '../../common/dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(NotificationModel)
    private readonly model: typeof NotificationModel,
  ) {}

  async findAll(filters: FindAllDto) {
    const offset = _.toNumber(filters.pageIndex) * _.toNumber(filters.pageSize);
    const limit = _.toNumber(filters.pageSize);

    const sort_order = filters.sortOrder;
    const sort_by = filters.sortBy;
    const dateFrom = filters.dateFrom;
    const dateTo = filters.dateTo;

    const notification_type = filters.notification_type;
    const notification_type_id = filters.notification_type_id;

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
      where: { ...where, notification_type, notification_type_id },
    });
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
    body,
    currentUser,
  }: {
    id: number;
    body: DeleteDto;
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
    await model.update({
      is_active: false,
      update_by: currentUser.user_id,
    });
    return { message: 'deleted' };
  }
}
