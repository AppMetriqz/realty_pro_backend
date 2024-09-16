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
import { UnitSalePlanDetailsView } from '../view/unit-sale-plan-details/unit-sale-plan-details.model';

@Injectable()
export class FinanceService {
  constructor(
    @InjectModel(PaymentPlanModel)
    private readonly PaymentPlan: typeof PaymentPlanModel,
    @InjectModel(PaymentPlanDetailModel)
    private readonly PaymentPlanDetail: typeof PaymentPlanDetailModel,
    @InjectModel(UnitModel) private readonly Unit: typeof UnitModel,
    @InjectModel(SaleModel) private readonly Sale: typeof SaleModel,
    @InjectModel(UnitSalePlanDetailsView)
    private readonly UnitSalePlanDetails: typeof UnitSalePlanDetailsView,
  ) {}

  async findAll(filters: FindAllDto) {
    const projectIds = filters.projectIds;

    const total_capacity_promise = await this.UnitSalePlanDetails.sum(
      'amount',
      {
        where: {
          project_id: projectIds,
        },
      },
    );

    const payments_received_promise = await this.UnitSalePlanDetails.sum(
      'stat_payment_received',
      {
        where: {
          project_id: projectIds,
        },
      },
    );

    const payments_pending_promise = await this.UnitSalePlanDetails.sum(
      'stat_payment_pending',
      {
        where: {
          project_id: projectIds,
          unit_status: 'sold',
          sale_is_active: true,
        },
      },
    );

    const available_promise = await this.Unit.findAll({
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

    const sold_promise = await this.Unit.findAll({
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

    const reserved_promise = await this.Unit.findAll({
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

    const sales_promise = await this.Sale.findAll({
      raw: true,
      nest: true,
      attributes: [
        [Sequelize.fn('YEAR', Sequelize.col('separated_at')), 'year'],
        [Sequelize.fn('MONTH', Sequelize.col('separated_at')), 'month'],
        [Sequelize.fn('Count', Sequelize.col('project_id')), 'total'],
      ],
      where: {
        project_id: projectIds,
        is_active: true,
        separated_at: {
          [Op.gte]: DateTime.now().minus({ month: 6 }).toJSDate(),
        },
      },
      group: ['month', 'year'],
      order: [['month', 'ASC']],
    });

    const separations = await this.UnitSalePlanDetails.count({
      where: {
        project_id: projectIds,
        stage: 'separation',
      },
    });

    const payment_plans_in_progress_promise =
      await this.UnitSalePlanDetails.count({
        where: {
          project_id: projectIds,
          payment_status: ['pending', 'resold'],
          stage: 'payment_plan_in_progress',
        },
      });

    const payment_plans_completed_promise =
      await this.UnitSalePlanDetails.count({
        where: {
          project_id: projectIds,
          payment_status: 'paid',
          stage: 'payment_plan_completed',
        },
      });

    const financed_promise = await this.UnitSalePlanDetails.count({
      where: {
        project_id: projectIds,
        payment_status: 'paid',
        stage: 'financed',
      },
    });

    const available = _.head(available_promise) as unknown as {
      amount: number;
      qty: number;
    };
    const sold = _.head(sold_promise) as unknown as {
      amount: number;
      qty: number;
    };
    const reserved = _.head(reserved_promise) as unknown as {
      amount: number;
      qty: number;
    };

    return {
      payments_received: payments_received_promise ?? 0,
      pending_payments: payments_pending_promise ?? 0,
      total_capacity: total_capacity_promise ?? 0,
      stages: {
        separations: separations,
        payment_plans_in_progress: payment_plans_in_progress_promise,
        payment_plans_completed: payment_plans_completed_promise,
        financed: financed_promise,
      },
      status: {
        available_unit: available,
        sold_unit: sold,
        reserved_unit: reserved,
      },
      sales: sales_promise,
    };
  }
}
