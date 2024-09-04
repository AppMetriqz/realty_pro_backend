import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FindAllDto } from './finance.dto';
import * as _ from 'lodash';
import { Op } from 'sequelize';
import { PaymentPlanDetailModel } from '../payment-plan-detail/payment-plan-detail.model';
import { Sequelize } from 'sequelize-typescript';
import { DateTime } from 'luxon';
import { PaymentPlanModel } from '../payment-plan/payment-plan.model';
import { UnitModel } from '../unit/unit.model';
import { SaleModel } from '../sale/sale.model';

@Injectable()
export class FinanceService {
  constructor(
    @InjectModel(PaymentPlanModel)
    private readonly PaymentPlan: typeof PaymentPlanModel,
    @InjectModel(PaymentPlanDetailModel)
    private readonly PaymentPlanDetail: typeof PaymentPlanDetailModel,
    @InjectModel(UnitModel) private readonly Unit: typeof UnitModel,
    @InjectModel(SaleModel) private readonly Sale: typeof SaleModel,
  ) {}

  async findAll(filters: FindAllDto) {
    const projectIds = filters.projectIds;

    const payments_received_promise = this.PaymentPlan.sum('total_amount', {
      where: {
        project_id: projectIds,
        sale_type: 'sale',
        status: 'paid',
        is_active: true,
      },
    });

    const total_pending_payments_plan_detail_promise =
      this.PaymentPlanDetail.sum('payment_amount', {
        where: {
          project_id: projectIds,
          status: { [Op.in]: ['pending'] },
          is_active: true,
        },
      });

    // TODO: Mejorar haciendolo con una vista
    const total_pending_payments_plan_promise = this.Unit.findAll({
      attributes: ['unit_id', 'project_id', 'price', 'status'],
      where: {
        project_id: projectIds,
        is_active: true,
      },
      include: [
        {
          attributes: ['status', 'sale_type', 'total_amount', 'is_active'],
          required: false,
          model: PaymentPlanModel,
        },
      ],
    });

    const available_promise = this.Unit.findAll({
      raw: true,
      nest: true,
      attributes: [
        [Sequelize.fn('sum', Sequelize.col('price')), 'amount'],
        [Sequelize.fn('count', Sequelize.col('project_id')), 'qty'],
      ],
      where: {
        project_id: projectIds,
        status: 'available',
        is_active: true,
      },
    });

    const sold_promise = this.Unit.findAll({
      raw: true,
      nest: true,
      attributes: [
        [Sequelize.fn('sum', Sequelize.col('price')), 'amount'],
        [Sequelize.fn('count', Sequelize.col('project_id')), 'qty'],
      ],
      where: {
        project_id: projectIds,
        status: 'sold',
        is_active: true,
      },
    });

    const reserved_promise = this.Unit.findAll({
      raw: true,
      nest: true,
      attributes: [
        [Sequelize.fn('sum', Sequelize.col('price')), 'amount'],
        [Sequelize.fn('count', Sequelize.col('project_id')), 'qty'],
      ],
      where: {
        project_id: projectIds,
        status: 'reserved',
        is_active: true,
      },
    });

    const sales_promise = this.Sale.findAll({
      raw: true,
      nest: true,
      attributes: [
        [Sequelize.fn('YEAR', Sequelize.col('created_at')), 'year'],
        [Sequelize.fn('MONTH', Sequelize.col('created_at')), 'month'],
        [Sequelize.fn('Count', Sequelize.col('project_id')), 'total'],
      ],
      where: {
        project_id: projectIds,
        is_active: true,
        created_at: { [Op.gte]: DateTime.now().minus({ month: 6 }).toJSDate() },
      },
      group: ['month', 'year'],
      order: [['month', 'ASC']],
    });

    const separations = await this.Sale.count({
      where: {
        is_active: true,
        project_id: projectIds,
        stage: 'separation',
      },
    });

    const payment_plans_in_progress_promise = this.PaymentPlan.count({
      where: {
        project_id: projectIds,
        status: ['pending', 'resold'],
        sale_type: 'sale',
        is_active: true,
      },
      include: [
        {
          required: true,
          model: SaleModel,
          where: {
            stage: 'payment_plan_in_progress',
          },
        },
      ],
    });

    const payment_plans_completed_promise = this.PaymentPlan.count({
      where: {
        project_id: projectIds,
        status: 'paid',
        sale_type: 'sale',
        is_active: true,
      },
      include: [
        {
          required: true,
          model: SaleModel,
          where: {
            stage: 'payment_plan_completed',
          },
        },
      ],
    });

    const financed_promise = this.PaymentPlan.count({
      where: {
        project_id: projectIds,
        status: 'paid',
        sale_type: 'sale',
        is_active: true,
      },
      include: [
        {
          required: true,
          model: SaleModel,
          where: {
            stage: 'financed',
          },
        },
      ],
    });

    const [
      payments_received,
      total_pending_payments_plan_detail,
      available_model,
      sold_model,
      reserved_model,
      sales,
      payment_plans_in_progress,
      payment_plans_completed,
      financed,
      total_pending_payments_plan,
    ] = await Promise.all([
      payments_received_promise,
      total_pending_payments_plan_detail_promise,
      available_promise,
      sold_promise,
      reserved_promise,
      sales_promise,
      payment_plans_in_progress_promise,
      payment_plans_completed_promise,
      financed_promise,
      total_pending_payments_plan_promise,
    ]);

    const available = _.head(available_model) as unknown as {
      amount: number;
      qty: number;
    };
    const sold = _.head(sold_model) as unknown as {
      amount: number;
      qty: number;
    };
    const reserved = _.head(reserved_model) as unknown as {
      amount: number;
      qty: number;
    };

    const available_amount = available.amount ?? 0;
    const sold_amount = sold.amount ?? 0;
    const reserved_amount = reserved.amount ?? 0;

    const total_capacity = available_amount + sold_amount + reserved_amount;

    const filterpending_payments_plan = total_pending_payments_plan.filter(
      (item) =>
        item.payment_plan[0]?.status !== 'paid' &&
        item.payment_plan[0]?.sale_type !== 'resold',
    );

    const total_pending_payments_plan_price = _.sumBy(
      filterpending_payments_plan,
      'price',
    );

    const pending_payments =
      _.toNumber(total_pending_payments_plan_price) -
      _.toNumber(total_pending_payments_plan_detail);

    return {
      payments_received: payments_received ?? 0,
      pending_payments: pending_payments ?? 0,
      total_capacity: total_capacity ?? 0,
      stages: {
        separations: separations,
        payment_plans_in_progress: payment_plans_in_progress,
        payment_plans_completed: payment_plans_completed,
        financed: financed,
      },
      status: {
        available_unit: available,
        sold_unit: sold,
        reserved_unit: reserved,
      },
      sales: sales,
      items: filterpending_payments_plan,
    };
  }
}
