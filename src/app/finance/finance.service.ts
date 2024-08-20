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

    const payments_received_promise = this.PaymentPlanDetail.sum(
      'amount_paid',
      {
        where: {
          project_id: projectIds,
          status: { [Op.notIn]: ['canceled'] },
          is_active: true,
        },
      },
    );

    const pending_payments_promise = this.PaymentPlanDetail.sum(
      'payment_amount',
      {
        where: {
          project_id: projectIds,
          status: { [Op.in]: ['pending'] },
          is_active: true,
        },
      },
    );

    const total_capacity_promise = this.PaymentPlanDetail.sum(
      'payment_amount',
      {
        where: {
          project_id: projectIds,
          sale_type: 'sale',
          status: { [Op.notIn]: ['canceled'] },
          is_active: true,
        },
      },
    );

    const available_promise = this.Unit.findAll({
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
      },
    });

    const payment_plans_in_progress_promise = this.PaymentPlan.count({
      where: {
        project_id: projectIds,
        status: ['pending', 'resold'],
        sale_type: 'sale',
        is_active: true,
      },
    });

    const payment_plans_completed_promise = this.PaymentPlan.count({
      where: {
        project_id: projectIds,
        status: 'paid',
        sale_type: 'sale',
        is_active: true,
      },
    });

    const financed_promise = this.PaymentPlan.count({
      where: {
        project_id: projectIds,
        status: 'financed',
        sale_type: 'sale',
        is_active: true,
      },
    });

    const [
      payments_received,
      pending_payments,
      total_capacity,
      available_model,
      sold_model,
      reserved_model,
      sales,
      payment_plans_in_progress,
      payment_plans_completed,
      financed,
    ] = await Promise.all([
      payments_received_promise,
      pending_payments_promise,
      total_capacity_promise,
      available_promise,
      sold_promise,
      reserved_promise,
      sales_promise,
      payment_plans_in_progress_promise,
      payment_plans_completed_promise,
      financed_promise,
    ]);

    const available = _.head(available_model);
    const sold = _.head(sold_model);
    const reserved = _.head(reserved_model);

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
    };
  }
}
