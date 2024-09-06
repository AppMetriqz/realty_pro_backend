import { Injectable } from '@nestjs/common';
import { PaymentPlanModel } from './payment-plan.model';
import { InjectModel } from '@nestjs/sequelize';
import {
  CreateDto,
  DeleteDto,
  FindAllDto,
  FindStatsDto,
  PaymentPlanDto,
} from './payment-plan.dto';
import * as _ from 'lodash';
import { Op } from 'sequelize';
import {
  DateFormat,
  getCurrencyFormat,
  StatusCodes,
} from '../../common/constants';
import { CurrentUserDto } from '../../common/dto';
import { createNotifications, ModelProperties } from './payment-plan.core';
import { PaymentPlanDetailModel } from '../payment-plan-detail/payment-plan-detail.model';
import { Sequelize } from 'sequelize-typescript';
import { DateTime } from 'luxon';
import { ProjectModel } from '../project/project.model';
import { UnitModel } from '../unit/unit.model';
import { SaleModel } from '../sale/sale.model';
import { NotificationModel } from '../notification/notification.model';
import { SaleClientHistoryModel } from '../sale-client-history/sale-client-history.model';
import { ContactModel } from '../contact/contact.model';
import { WhereOperators } from 'sequelize/types/model';
import { onFullCancellation } from '../../common/utils/full-cancellation';
import { PaymentModel } from '../payment/payment.model';
import { UnitSalePlanDetailsView } from '../view/unit-sale-plan-details/unit-sale-plan-details.model';

type Total = {
  qty: number;
  payment_amount: number;
  amount_paid: number;
};

@Injectable()
export class PaymentPlanService {
  constructor(
    @InjectModel(PaymentPlanModel)
    private readonly model: typeof PaymentPlanModel,
    @InjectModel(PaymentPlanDetailModel)
    private readonly PaymentPlanDetail: typeof PaymentPlanDetailModel,
    @InjectModel(ProjectModel) private readonly Project: typeof ProjectModel,
    @InjectModel(SaleModel) private readonly Sale: typeof SaleModel,
    @InjectModel(NotificationModel)
    private readonly Notification: typeof NotificationModel,
    @InjectModel(SaleClientHistoryModel)
    private readonly SaleClientHistory: typeof SaleClientHistoryModel,
    @InjectModel(ContactModel) private readonly Contact: typeof ContactModel,
    @InjectModel(PaymentModel) private readonly Payment: typeof PaymentModel,
    @InjectModel(UnitSalePlanDetailsView)
    private readonly UnitSalePlanDetails: typeof UnitSalePlanDetailsView,
    private sequelize: Sequelize,
  ) {}

  async findAll(filters: FindAllDto) {
    const offset = _.toNumber(filters.pageIndex) * _.toNumber(filters.pageSize);
    const limit = _.toNumber(filters.pageSize);
    const sort_order = filters.sortOrder;
    const sort_by = filters.sortBy;
    const dateFrom = filters.dateFrom;
    const dateTo = filters.dateTo;

    let order = undefined;
    const projectIds = filters.projectIds;
    const planFilterStats = filters.planFilterStats;

    const today = DateTime.now().setZone('America/Santo_Domingo');

    const where: {
      is_active: boolean;
      project_id: WhereOperators;
      status?: string;
      created_at?: WhereOperators;
      payment_date?: WhereOperators;
    } = {
      is_active: true,
      project_id: {
        [Op.in]: projectIds,
      },
    };

    if (_.size(sort_order) > 0 && _.size(sort_by) > 0) {
      order = [[sort_by, sort_order]];
    }

    if (_.size(dateFrom) > 0 && _.size(dateTo) > 0) {
      where.created_at = { [Op.between]: [dateFrom, dateTo] };
    }

    switch (planFilterStats) {
      case 'overdue_payment':
        where.payment_date = {
          [Op.lt]: today.toFormat(DateFormat),
        };
        where.status = 'pending';
        break;
      case 'pending_payment':
        where.payment_date = {
          [Op.gte]: today.toFormat(DateFormat),
        };
        where.status = 'pending';
        break;
    }

    const result = await this.PaymentPlanDetail.findAndCountAll({
      limit,
      offset,
      distinct: true,
      where: { ...where },
      attributes: {
        exclude: ['payment_plan_id', 'project_id'],
      },
      nest: true,
      raw: true,
      include: [
        {
          model: ProjectModel,
          attributes: ['project_id', 'name', 'currency_type'],
        },
        {
          model: PaymentPlanModel,
          attributes: ['payment_plan_id', 'status', 'sale_type'],
          include: [
            {
              model: SaleModel,
              attributes: ['sale_id', 'stage'],
              include: [
                {
                  model: ContactModel,
                  as: 'client',
                  attributes: [
                    'contact_id',
                    'first_name',
                    'last_name',
                    'phone_number_1',
                  ],
                  order,
                },
              ],
            },
            {
              model: UnitModel,
              attributes: ['unit_id', 'name'],
            },
          ],
        },
      ],
    });

    const rows = result.rows.map((result) => {
      const paymentPlan = _.get(result, 'payment_plan', null);
      const sale = _.get(paymentPlan, 'sale', null);
      const unit = _.get(paymentPlan, 'unit', null);
      const client = _.get(sale, 'client', null);

      const targetDate = DateTime.fromFormat(result.payment_date, DateFormat);
      const remaining_time = targetDate
        .diff(today, ['days', 'hours'])
        .toObject();

      return {
        ..._.omit(result, 'payment_plan'),
        payment_plan: _.omit(paymentPlan, ['sale', 'unit']),
        sale: _.omit(sale, 'client'),
        unit,
        client,
        remaining_time,
      };
    });

    return {
      count: result.count,
      rows,
    };
  }

  async findAllFinancing(filters: FindAllDto) {
    const offset = _.toNumber(filters.pageIndex) * _.toNumber(filters.pageSize);
    const limit = _.toNumber(filters.pageSize);
    const sort_order = filters.sortOrder;
    const sort_by = filters.sortBy;
    let order = undefined;
    const projectIds = filters.projectIds;

    const today = DateTime.now().setZone('America/Santo_Domingo');

    if (_.size(sort_order) > 0 && _.size(sort_by) > 0) {
      order = [[sort_by, sort_order]];
    }

    const result = await this.model.findAndCountAll({
      limit,
      offset,
      order,
      nest: true,
      raw: true,
      distinct: true,
      where: {
        project_id: projectIds,
        status: 'paid',
        is_active: true,
      },
      attributes: [
        ...Object.keys(this.model.getAttributes()),
        [
          Sequelize.literal(
            '(SELECT Sum(amount_paid) FROM payment_plan_details WHERE payment_plan_details.payment_plan_id  = payment_plan.payment_plan_id)',
          ),
          'total_amount_paid',
        ],
      ],
      include: [
        {
          model: ProjectModel,
          attributes: ['project_id', 'name', 'currency_type'],
        },
        {
          model: UnitModel,
          attributes: ['unit_id', 'name'],
        },
        {
          model: SaleModel,
          attributes: ['sale_id', 'stage'],
          include: [
            {
              model: ContactModel,
              as: 'client',
              attributes: [
                'contact_id',
                'first_name',
                'last_name',
                'phone_number_1',
              ],
              order,
            },
          ],
          where: {
            stage: [
              'separation',
              'payment_plan_in_progress',
              'payment_plan_completed',
            ],
          },
        },
      ],
    });

    const rows = result.rows.map((result: PaymentPlanDto) => {
      const separation_date = result.separation_date as string;
      const payment_plan_numbers = result.payment_plan_numbers;

      const until_date = DateTime.fromFormat(separation_date, DateFormat).plus({
        month: payment_plan_numbers,
      });

      const remaining_time = until_date
        .diff(today, ['days', 'hours'])
        .toObject();

      const sale = _.get(result, 'sale', null);
      const client = _.get(sale, 'client', null);

      const total_amount = _.toNumber(result.total_amount);

      const total_amount_paid = _.toNumber(result.total_amount_paid);
      const separation_amount = _.toNumber(result.separation_amount);

      const total_amount_financed =
        total_amount - (total_amount_paid + separation_amount);

      return {
        ...result,
        remaining_time,
        sale: _.omit(sale, 'client'),
        client,
        total_amount_paid: total_amount_financed,
      };
    });

    return {
      count: result.count,
      rows,
    };
  }

  async findAllStats(filters: FindStatsDto) {
    const projectIds = filters.projectIds;

    const today = DateTime.now()
      .setZone('America/Santo_Domingo')
      .toFormat(DateFormat);

    const promise1 = this.PaymentPlanDetail.findAll({
      raw: true,
      nest: true,
      attributes: [
        [
          Sequelize.fn('SUM', Sequelize.col('payment_amount')),
          'payment_amount',
        ],
        [Sequelize.fn('SUM', Sequelize.col('amount_paid')), 'amount_paid'],
        [Sequelize.fn('Count', Sequelize.col('payment_plan_detail_id')), 'qty'],
      ],
      where: {
        is_active: true,
        project_id: {
          [Op.in]: projectIds,
        },
        payment_date: {
          [Op.lt]: today,
        },
        status: 'pending',
      },
    });

    const promise2 = this.PaymentPlanDetail.findAll({
      raw: true,
      nest: true,
      attributes: [
        [
          Sequelize.fn('SUM', Sequelize.col('payment_amount')),
          'payment_amount',
        ],
        [Sequelize.fn('SUM', Sequelize.col('amount_paid')), 'amount_paid'],
        [Sequelize.fn('Count', Sequelize.col('payment_plan_detail_id')), 'qty'],
      ],
      where: {
        is_active: true,
        project_id: {
          [Op.in]: projectIds,
        },
        payment_date: {
          [Op.gte]: today,
        },
        status: 'pending',
      },
    });

    const financing_payments = await this.UnitSalePlanDetails.findAll({
      attributes: ['stat_payment_financing'],
      where: {
        stage: 'payment_plan_completed',
        project_id: projectIds,
      },
    });

    const [overdue_payments, pending_payments] = await Promise.allSettled([
      promise1,
      promise2,
    ]);

    const overdue_payments_value =
      overdue_payments.status === 'fulfilled'
        ? _.head(overdue_payments.value)
        : null;
    const pending_payments_value =
      pending_payments.status === 'fulfilled'
        ? _.head(pending_payments.value)
        : null;

    const overdue_payments_total = overdue_payments_value as unknown as Total;
    const pending_payments_total = pending_payments_value as unknown as Total;

    return {
      overdue_payments: {
        total:
          _.toNumber(overdue_payments_total.payment_amount) -
          _.toNumber(overdue_payments_total.amount_paid),
        qty: overdue_payments_total.qty,
      },
      pending_payments: {
        total:
          _.toNumber(pending_payments_total.payment_amount) -
          _.toNumber(pending_payments_total.amount_paid),
        qty: pending_payments_total.qty,
      },
      financing_payments: {
        total: _.sumBy(financing_payments, 'stat_payment_financing'),
        qty: _.size(financing_payments),
      },
    };
  }

  async findOne({ id }: { id: number }) {
    const model = await this.model.findByPk(id, { ...ModelProperties });
    if (!model || !model.is_active) {
      return {
        ...StatusCodes.NotFound,
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
    const sale = await this.Sale.findOne({
      where: { sale_id: body.sale_id, is_active: true },
    });
    if (!sale) {
      return {
        ...StatusCodes.NotFound,
      };
    }

    if (sale.client_id === 1 && !body.is_resale) {
      return {
        ...StatusCodes.BadRequest,
        message:
          'Debe asignar un cliente a la venta antes de crear un plan de pago.',
      };
    }

    const is_resale = body.is_resale;
    const total_amount = is_resale ? body.total_amount : sale.price;
    const client_id = is_resale ? body.client_id : null;
    const project_id = sale.project_id;
    const unit_id = sale.unit_id;
    const sale_id = sale.sale_id;

    const currentUserId = currentUser.user_id;

    if (client_id === sale.client_id) {
      return {
        ...StatusCodes.BadRequest,
        message:
          'No puede revender al mismo cliente. Intente añadir un cliente diferente',
      };
    }

    const before_payment_plan = await this.model.findOne({
      where: {
        sale_id: sale_id,
        is_active: true,
        status: { [Op.notIn]: ['canceled'] },
      },
    });

    const before_payment_plan_id = before_payment_plan?.payment_plan_id ?? null;

    if (!before_payment_plan && is_resale) {
      return {
        ...StatusCodes.BadRequest,
        message:
          'No se puede realizar una reventa sin realizar antes una venta.',
      };
    } else if (before_payment_plan && !is_resale) {
      return {
        ...StatusCodes.BadRequest,
        message: 'Esta venta ya tiene un plan de pago en curso.',
      };
    }

    return await this.sequelize.transaction(async (transaction) => {
      const project = await this.Project.findByPk(project_id);

      const values = {
        ...body,
        project_id: project_id,
        unit_id: unit_id,
        total_amount,
        sale_type: is_resale ? 'resale' : 'sale',
        create_by: currentUserId,
      };

      const payment_plan = await this.model.create(values, { transaction });

      const payment_plan_id = payment_plan.payment_plan_id;
      const separation_date = payment_plan.separation_date;
      const payment_plan_numbers = payment_plan.payment_plan_numbers;
      const separation_rate = payment_plan.separation_rate;
      const separation_amount = payment_plan.separation_amount;
      const payment_plan_amount =
        total_amount * separation_rate - separation_amount;
      const payment_amount = payment_plan_amount / payment_plan_numbers;

      const payment_plan_detail = _.map(
        _.range(1, payment_plan_numbers + 1),
        (payment_number) => {
          const payment_start = DateTime.fromFormat(separation_date, DateFormat)
            .plus({ month: payment_number })
            .toFormat(DateFormat);

          return {
            payment_number: payment_number,
            payment_plan_id: payment_plan_id,
            payment_amount: payment_amount,
            payment_date: payment_start,
            create_by: currentUserId,
            project_id: project_id,
            unit_id: unit_id,
            sale_id: sale_id,
            sale_type: is_resale ? 'resale' : 'sale',
          };
        },
      );

      await this.PaymentPlanDetail.bulkCreate(payment_plan_detail, {
        transaction,
        ignoreDuplicates: true,
      });

      await sale.update({ stage: 'payment_plan_in_progress' }, { transaction });

      if (is_resale && before_payment_plan_id) {
        const client = await this.Contact.findByPk(client_id, {
          plain: true,
          raw: true,
        });
        const promise1 = this.model.update(
          { status: 'resold', update_by: currentUserId },
          {
            where: { payment_plan_id: before_payment_plan_id },
            transaction,
          },
        );
        const promise2 = this.PaymentPlanDetail.update(
          { status: 'resold', update_by: currentUserId },
          {
            where: {
              payment_plan_id: before_payment_plan_id,
              status: 'pending',
            },
            transaction,
          },
        );
        const promise3 = sale.update({ client_id: client_id }, { transaction });
        const promise4 = this.SaleClientHistory.create(
          {
            sale_id: sale.sale_id,
            client_id: client_id,
            sale_type: 'resale',
            total_amount: body.total_amount,
          },
          { transaction, ignoreDuplicates: true },
        );
        const promise5 = this.Notification.create({
          name: 'Venta',
          description: `Reventa creada hacia ${client.first_name} ${client.last_name}`,
          notification_type: 'sale',
          notification_type_id: sale_id,
          notification_date: DateTime.now().toFormat(DateFormat),
          create_by: currentUserId,
        });
        const promises = [promise1, promise2, promise3, promise4, promise5];
        await Promise.allSettled(promises);
      }

      const currency_type = project.currency_type;
      const symbol = `${currency_type}$`;

      if (!is_resale) {
        await createNotifications({
          description1: `${getCurrencyFormat(separation_amount, symbol)} - Pago de Separación`,
          description2: `Plan de Pago Creado (${payment_plan_numbers} Meses) - ${getCurrencyFormat(payment_plan_amount, symbol)}`,
          create_by: currentUserId,
          sale_id: sale_id,
          transaction,
          Notification: this.Notification,
          dateFormat: DateFormat,
        });

        await this.SaleClientHistory.update(
          { client_id: sale.client_id },
          {
            where: {
              sale_id: sale.sale_id,
              sale_type: 'sale',
            },
            transaction,
          },
        );
      }

      return payment_plan;
    });
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
    if (!model || !model.is_active) {
      return {
        ...StatusCodes.NotFound,
      };
    }

    if (model.status === 'canceled') {
      return {
        ...StatusCodes.BadRequest,
        message: 'Este método de pago ya ha sido cancelado',
      };
    }

    return await onFullCancellation({
      payment_plan_id: id,
      isPaymentDelete: body.isDelete,
      notes: body.notes,
      sale_id: model.sale_id,
      user_id: currentUser.user_id,
      sequelize: this.sequelize,
      Notification: this.Notification,
      PaymentPlan: this.model,
      PaymentPlanDetail: this.PaymentPlanDetail,
      Payment: this.Payment,
    });
  }
}
