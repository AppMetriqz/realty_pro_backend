import { Injectable } from '@nestjs/common';
import { PaymentModel } from './payment.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateDto, DeleteDto, FindAllDto, UpdateDto } from './payment.dto';
import * as _ from 'lodash';
import { Op } from 'sequelize';
import { StatusCodes } from '../../common/constants';
import { CurrentUserDto } from '../../common/dto';
import { ModelProperties, getPaidAmountByPlanNumber } from './payment.core';
import { Sequelize } from 'sequelize-typescript';
import { PaymentPlanDetailModel } from '../payment-plan-detail/payment-plan-detail.model';
import { PaymentPlanModel } from '../payment-plan/payment-plan.model';
import { SaleModel } from '../sale/sale.model';
import { LoggerModel } from '../logger/logger.model';
import { DateTime } from 'luxon';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(PaymentModel) private readonly model: typeof PaymentModel,
    @InjectModel(PaymentPlanDetailModel)
    private readonly PaymentPlanDetail: typeof PaymentPlanDetailModel,
    @InjectModel(PaymentPlanModel)
    private readonly PaymentPlan: typeof PaymentPlanModel,
    @InjectModel(SaleModel) private readonly Sale: typeof SaleModel,
    @InjectModel(LoggerModel) private readonly Logger: typeof LoggerModel,
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
    const where: { created_at?: any; is_active: boolean } = { is_active: true };

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
    const paymentPlan = await this.PaymentPlan.findOne({
      where: {
        payment_plan_id: body.payment_plan_id,
        is_active: true,
        status: ['pending', 'paid', 'financed'],
      },
    });

    if (!paymentPlan) {
      return {
        ...StatusCodes.NotFound,
        message: StatusCodes.NotFound.message,
      };
    }

    if (paymentPlan.status === 'paid') {
      return {
        ...StatusCodes.BadRequest,
        message: 'No tiene deuda pendiente',
      };
    }

    if (paymentPlan.status === 'paid') {
      return {
        ...StatusCodes.BadRequest,
        message: 'Esta unidad ya ha sido financiada',
      };
    }

    const paymentPlanDetailsModel = await this.PaymentPlanDetail.findAll({
      where: {
        payment_plan_id: body.payment_plan_id,
        is_active: true,
        status: 'pending',
      },
    });

    if (_.isEmpty(paymentPlanDetailsModel)) {
      return {
        ...StatusCodes.BadRequest,
        message: 'No tiene deuda pendiente',
      };
    }

    const paymentPlanDetails = _.orderBy(
      paymentPlanDetailsModel,
      ['payment_number ', 'payment_date'],
      ['asc', 'asc'],
    );

    const total_plan_pending = _.size(paymentPlanDetails);
    const paymentPlanDetail = _.head(paymentPlanDetails);

    const plan_amount_paid = _.toNumber(paymentPlanDetail.amount_paid);
    const plan_payment_amount = _.toNumber(paymentPlanDetail.payment_amount);

    const amount_paid = body.amount;
    const payment_made_at = body.payment_made_at
      ? body.payment_made_at
      : new Date();

    return await this.sequelize.transaction(async (transaction) => {
      const values = {
        payment_plan_id: body.payment_plan_id,
        project_id: paymentPlan.project_id,
        unit_id: paymentPlan.unit_id,
        sale_id: paymentPlan.sale_id,
        amount: amount_paid,
        create_by: currentUser.user_id,
        payment_made_at: payment_made_at,
      };

      const payment = await this.model.create(values, { transaction });
      const pending_amount = plan_payment_amount - plan_amount_paid;
      const total_amount_remaining = amount_paid - pending_amount;
      let total_amount_paid = amount_paid;

      if (plan_amount_paid > 0 && total_amount_remaining > 0) {
        total_amount_paid = total_amount_remaining;
      }

      let amounts_plan = getPaidAmountByPlanNumber(
        total_amount_paid,
        plan_payment_amount,
      );

      if (plan_amount_paid > 0 && total_amount_remaining > 0) {
        amounts_plan = _.concat(pending_amount, amounts_plan);
      }

      await this.Logger.create({
        ref_id: paymentPlan.payment_plan_id,
        name: 'before amounts_plan',
        values: JSON.stringify({
          amounts_plan,
          total_plan_pending,
          paymentPlanDetail,
          plan_amount_paid,
          plan_payment_amount,
          amount_paid,
        }),
      });

      const [amounts_to_paid, amounts_to_credit] = [
        _.take(amounts_plan, total_plan_pending),
        _.drop(amounts_plan, total_plan_pending),
      ];

      const credit_last_paid = _.sum(amounts_to_credit);
      const lastIndex = amounts_to_paid.length - 1;
      const last_plan_amount = _.last(amounts_to_paid) + credit_last_paid;
      amounts_plan = _.set(amounts_to_paid, lastIndex, last_plan_amount);

      await this.Logger.create({
        ref_id: paymentPlan.payment_plan_id,
        name: 'after amounts_plan',
        values: JSON.stringify({ amounts_plan }),
      });

      for (let i = 0; i < amounts_plan.length; i++) {
        const installment = paymentPlanDetails[i];
        const plan_detail_id = installment.payment_plan_detail_id;
        const payment_amount = amounts_plan[i];
        const Plan = await this.PaymentPlanDetail.findByPk(plan_detail_id);

        await Plan.increment({ amount_paid: payment_amount });
        await Plan.update({ payment_made_at: payment_made_at });

        if (amount_paid > 0 && i === 0) {
          await Plan.update({ total_amount_paid: amount_paid });
        }

        await Plan.reload();
        const amount_paid_model = _.toNumber(Plan.amount_paid);
        const payment_amount_model = _.toNumber(Plan.payment_amount);
        if (amount_paid_model >= payment_amount_model) {
          await Plan.update(
            { status: 'paid', paid_at: new Date() },
            { transaction },
          );
        }
      }

      const planCount = await this.PaymentPlanDetail.count({
        where: { payment_plan_id: body.payment_plan_id, status: 'pending' },
        transaction,
      });

      if (planCount === 0) {
        await paymentPlan.update(
          { status: 'paid', paid_at: new Date() },
          { transaction },
        );
        await this.Sale.update(
          { stage: 'payment_plan_completed' },
          { where: { sale_id: paymentPlan.sale_id }, transaction },
        );
      }

      return payment;
    });
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

    const values = {
      ...body,
      update_by: currentUser.user_id,
    };

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
