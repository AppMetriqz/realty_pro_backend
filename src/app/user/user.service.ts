import { Injectable } from '@nestjs/common';
import { UserModel } from './user.model';
import { InjectModel } from '@nestjs/sequelize';
import {
  ChangePasswordDto,
  CreateDto,
  DeleteDto,
  FindAllAutocompleteDto,
  FindAllDto,
  UpdateDto,
} from './user.dto';
import * as _ from 'lodash';
import { Op } from 'sequelize';
import { StatusCodes } from '../../common/constants';
import { CurrentUserDto } from '../../common/dto';
import { PasswordGuard } from '../../common/guards';
import { ModelProperties } from './user.core';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserModel) private readonly model: typeof UserModel,
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
      ...ModelProperties,
      limit,
      offset,
      order,
      where: { ...where },
    });
  }

  async findAllAutocomplete(filters: FindAllAutocompleteDto) {
    const description = filters.description;
    return await this.model.findAll({
      limit: 10,
      attributes: ['contact_id', 'first_name', 'last_name', 'national_id'],
      order: [['first_name', 'ASC']],
      where: {
        [Op.or]: [
          { first_name: { [Op.like]: `%${description}%` } },
          { last_name: { [Op.like]: `%${description}%` } },
          { phone_number: { [Op.like]: `%${description}%` } },
          { national_id: { [Op.like]: `%${description}%` } },
          { email: { [Op.like]: `%${description}%` } },
        ],
      },
    });
  }

  async findOne({ id }: { id: number }) {
    const model = await this.model.findByPk(id, { ...ModelProperties });
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
    body.password = new PasswordGuard().hashPassword(body.password);
    return await this.model.create(body);
  }

  async changePassword({
    body,
    currentUser,
  }: {
    body: ChangePasswordDto;
    currentUser: CurrentUserDto;
  }) {
    const model = await this.model.findOne({
      where: { user_id: currentUser.user_id, status_id: 1 },
    });

    const { old_password, new_password } = body;

    if (!model) {
      return {
        statusCode: StatusCodes.NotFound.statusCode,
        error: StatusCodes.NotFound.error,
        message: StatusCodes.NotFound.message,
      };
    }

    const isValid = new PasswordGuard().checkPassword(
      old_password,
      model.password,
    );

    if (!isValid) {
      return {
        statusCode: StatusCodes.UnAuthorized.statusCode,
        error: StatusCodes.UnAuthorized.error,
        message: 'Invalid password',
      };
    }

    const password = new PasswordGuard().hashPassword(new_password);

    return await model.update({ password });
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

    const values = { ...body };

    if (_.size(body.password) > 0) {
      values.password = new PasswordGuard().hashPassword(body.password);
    } else {
      delete values.password;
    }

    values.update_by = currentUser.user_id;
    return model.update(values);
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
      notes: body.notes,
      update_by: currentUser.user_id,
    });
    return { message: 'deleted' };
  }
}
