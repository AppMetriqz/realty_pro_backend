import { Injectable } from '@nestjs/common';
import { ContactModel } from './contact.model';
import { InjectModel } from '@nestjs/sequelize';
import {
  CreateDto,
  DeleteDto,
  FindAllAutocompleteDto,
  FindAllDto,
  FindAllPaymentPlansDto,
  UpdateDto,
} from './contact.dto';
import * as _ from 'lodash';
import sequelize, { Op } from 'sequelize';
import {
  onRemoveCircularReferences,
  StatusCodes,
} from '../../common/constants';
import { CurrentUserDto } from '../../common/dto';
import { ModelProperties } from './contact.core';
import { PaymentPlanModel } from '../payment-plan/payment-plan.model';
import { PaymentPlanDetailModel } from '../payment-plan-detail/payment-plan-detail.model';
import { SaleModel } from '../sale/sale.model';
import { ProjectModel } from '../project/project.model';
import { UnitModel } from '../unit/unit.model';
import { Sequelize } from 'sequelize-typescript';
import { WhereOperators } from 'sequelize/types/model';
import { PaymentModel } from '../payment/payment.model';
import { ContactPaymentPlanView } from '../view/contact-payment-plan/contact-payment-plan.model';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(ContactModel) private readonly model: typeof ContactModel,
    @InjectModel(PaymentPlanModel)
    private readonly PaymentPlan: typeof PaymentPlanModel,
    @InjectModel(ContactPaymentPlanView)
    private readonly ContactPaymentPlan: typeof ContactPaymentPlanView,
  ) {}

  async findAll(filters: FindAllDto) {
    const offset = _.toNumber(filters.pageIndex) * _.toNumber(filters.pageSize);
    const limit = _.toNumber(filters.pageSize);
    const sort_order = filters.sortOrder;
    const sort_by = filters.sortBy;
    const dateFrom = filters.dateFrom;
    const dateTo = filters.dateTo;
    const type = filters.type;
    const searchText = filters.searchText ?? '';

    let order = undefined;
    const where: { created_at?: any; type?: string[] } = {};

    if (_.size(sort_order) > 0 && _.size(sort_by) > 0) {
      order = [[sort_by, sort_order]];
    }

    if (_.size(dateFrom) > 0 && _.size(dateTo) > 0) {
      where.created_at = { [Op.between]: [dateFrom, dateTo] };
    }

    if (_.size(type)) {
      where.type = type;
    }

    return await this.model.findAndCountAll({
      limit,
      offset,
      order,
      where: {
        ...where,
        [Op.or]: [
          { first_name: { [Op.like]: `%${searchText}%` } },
          { last_name: { [Op.like]: `%${searchText}%` } },
          { phone_number_1: { [Op.like]: `%${searchText}%` } },
          { phone_number_2: { [Op.like]: `%${searchText}%` } },
          { national_id: { [Op.like]: `%${searchText}%` } },
          { email: { [Op.like]: `%${searchText}%` } },
        ],
      },
    });
  }

  async findAllPaymentPlans(id: number, filters: FindAllPaymentPlansDto) {
    const status = filters.status;

    const where: { stage?: WhereOperators } = {};

    if (status === 'financed') {
      where.stage = { [Op.in]: ['financed'] };
    } else {
      where.stage = { [Op.notIn]: ['financed'] };
    }

    const paymentsPlan = await this.ContactPaymentPlan.findAll({
      order: [['payment_plan_id', 'DESC']],
      where: {
        is_active: true,
        [Op.or]: [
          {
            [Op.and]: [
              { sale_type: 'sale' },
              { status: ['resold'] },
              { current_client_id: { [Op.ne]: id } },
            ],
          },
          {
            [Op.and]: [
              { sale_type: 'resale' },
              { status: ['paid', 'pending'] },
              { current_client_id: { [Op.eq]: id } },
            ],
          },
        ],
        [Op.and]: sequelize.literal(`FIND_IN_SET(${id}, client_ids)`),
      },
      include: [
        {
          model: ProjectModel,
          attributes: ['project_id', 'name', 'description', 'currency_type'],
        },
        {
          model: UnitModel,
          attributes: ['unit_id', 'name', 'description'],
        },
        {
          model: SaleModel,
          where: { ...where },
          attributes: [
            'sale_id',
            'price',
            'commission',
            'stage',
            'financed_at',
          ],
          required: true,
        },
        {
          model: PaymentPlanDetailModel,
          order: [['payment_plan_detail_id', 'ASC']],
          attributes: [
            'payment_plan_detail_id',
            'payment_amount',
            'amount_paid',
            'total_amount_paid',
            'payment_number',
            'payment_date',
            'sale_type',
            'status',
            'updated_at',
            'paid_at',
            'payment_made_at',
          ],
        },
        {
          model: PaymentModel,
          order: [['payment_id', 'ASC']],
          attributes: [
            'payment_id',
            'amount',
            'payment_made_at',
            'created_at',
            'notes',
          ],
        },
      ],
    });

    const sanitizedPaymentsPlan = onRemoveCircularReferences(paymentsPlan);

    return sanitizedPaymentsPlan.map(
      (item: PaymentPlanModel & { total_amount_paid: number }) => {
        const total_amount = _.toNumber(item.total_amount);
        const total_amount_paid =
          _.toNumber(item.total_amount_paid) +
          _.toNumber(item.separation_amount);
        const total_financing = total_amount - total_amount_paid;
        return {
          total_financing,
          ...item,
        };
      },
    );
  }

  async findAllAutocomplete(filters: FindAllAutocompleteDto) {
    const description = filters.description;
    const type = filters.type;

    const where: { type?: string } = {};

    if (_.size(type) > 0) {
      where.type = type;
    }

    return await this.model.findAll({
      limit: 10,
      attributes: ['contact_id', 'first_name', 'last_name', 'national_id'],
      order: [['first_name', 'ASC']],
      where: {
        ...where,
        [Op.or]: [
          { first_name: { [Op.like]: `%${description}%` } },
          { last_name: { [Op.like]: `%${description}%` } },
          { phone_number_1: { [Op.like]: `%${description}%` } },
          { phone_number_2: { [Op.like]: `%${description}%` } },
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

    if (body.spouse_id > 0) {
      body.marital_status = 'married';
    }
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
        ...StatusCodes.NotFound,
      };
    }

    if (body.spouse_id > 0) {
      body.marital_status = 'married';
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
      notes: body.notes,
      update_by: currentUser.user_id,
    });
    return { message: 'deleted' };
  }
}
