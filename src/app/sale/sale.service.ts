import { Injectable } from '@nestjs/common';
import { SaleModel } from './sale.model';
import { InjectModel } from '@nestjs/sequelize';
import {
  CreateAllDto,
  CreateDto,
  DeleteDto,
  FindAllDto,
  UpdateDto,
} from './sale.dto';
import * as _ from 'lodash';
import { Op } from 'sequelize';
import { StatusCodes } from '../../common/constants';
import { CurrentUserDto } from '../../common/dto';
import { UnitModel } from '../unit/unit.model';
import { ModelProperties, createNotifications } from './sale.core';
import { NotificationModel } from '../notification/notification.model';
import { Sequelize } from 'sequelize-typescript';
import { ContactModel } from '../contact/contact.model';
import { PaymentPlanModel } from '../payment-plan/payment-plan.model';
import { PaymentPlanDetailModel } from '../payment-plan-detail/payment-plan-detail.model';
import { SaleClientHistoryModel } from '../sale-client-history/sale-client-history.model';
import { WhereOperators } from 'sequelize/types/model';
import { onFullCancellation } from '../../common/utils/full-cancellation';
import { PaymentModel } from '../payment/payment.model';
import { ProjectModel } from '../project/project.model';

@Injectable()
export class SaleService {
  constructor(
    @InjectModel(SaleModel) private readonly model: typeof SaleModel,
    @InjectModel(UnitModel) private readonly unit: typeof UnitModel,
    @InjectModel(PaymentModel) private readonly Payment: typeof PaymentModel,
    @InjectModel(ProjectModel) private readonly Project: typeof ProjectModel,
    @InjectModel(NotificationModel)
    private readonly Notification: typeof NotificationModel,
    @InjectModel(ContactModel) private readonly Contact: typeof ContactModel,
    @InjectModel(PaymentPlanModel)
    private readonly PaymentPlan: typeof PaymentPlanModel,
    @InjectModel(PaymentPlanDetailModel)
    private readonly PaymentPlanDetail: typeof PaymentPlanDetailModel,
    @InjectModel(SaleClientHistoryModel)
    private readonly SaleClientHistory: typeof SaleClientHistoryModel,
    private sequelize: Sequelize,
  ) {}

  async findAll(filters: FindAllDto) {
    const offset = _.toNumber(filters.pageIndex) * _.toNumber(filters.pageSize);
    const limit = _.toNumber(filters.pageSize);
    const sort_order = filters.sortOrder;
    const sort_by = filters.sortBy;
    const dateFrom = filters.dateFrom;
    const dateTo = filters.dateTo;
    const projectId = filters.projectId;

    const stage = filters.stage;

    let order = undefined;
    const where: {
      created_at?: WhereOperators;
      stage?: string[];
      project_id?: number;
    } = {};

    if (_.size(sort_order) > 0 && _.size(sort_by) > 0) {
      order = [[sort_by, sort_order]];
    }

    if (_.size(dateFrom) > 0 && _.size(dateTo) > 0) {
      where.created_at = { [Op.between]: [dateFrom, dateTo] };
    }

    if (_.size(stage) > 0) {
      where.stage = stage;
    }

    if (projectId > 0) {
      where.project_id = projectId;
    }

    return await this.model.findAndCountAll({
      ...ModelProperties,
      limit,
      offset,
      order,
      where: { ...where },
    });
  }

  async findOne({ id }: { id: number }) {
    const model = await this.model.findByPk(id, {
      ...ModelProperties,
    });

    if (!model || !model.is_active) {
      return {
        ...StatusCodes.NotFound,
      };
    }

    let amount_pending_sale = null;

    const PaymentPlan = await this.PaymentPlan.findOne({
      where: { sale_id: model.sale_id },
    });

    if (PaymentPlan) {
      const where = {
        payment_plan_id: PaymentPlan.payment_plan_id,
      };

      const total_amount_paid = await this.PaymentPlanDetail.sum(
        'amount_paid',
        {
          where: where,
        },
      );

      const total_payment_amount = await this.PaymentPlanDetail.sum(
        'payment_amount',
        { where: where },
      );

      amount_pending_sale = total_payment_amount - total_amount_paid;
    }

    const data = model.get({ plain: true });

    return {
      ...data,
      amount_pending_sale,
    };
  }

  async create({
    body,
    currentUser,
  }: {
    body: CreateDto;
    currentUser: CurrentUserDto;
  }) {
    const unit = await this.unit.findByPk(body.unit_id);

    if (!unit || !unit.is_active) {
      return {
        ...StatusCodes.NotFound,
      };
    }

    if (unit.status !== 'available') {
      return {
        ...StatusCodes.BadRequest,
        message: 'Esta unidad no está disponible',
      };
    }

    const values = {
      ...body,
      price: unit.price,
      stage: 'separation',
      create_by: currentUser.user_id,
    };

    return await this.sequelize.transaction(async (transaction) => {
      const sale = await this.model.create(values, { transaction });
      const seller_id = body?.seller_id;
      if (seller_id > 0) {
        await createNotifications({
          seller_id: seller_id,
          commission: body.commission,
          create_by: currentUser.user_id,
          sale_id: sale.sale_id,
          transaction,
          Notification: this.Notification,
          Contact: this.Contact,
        });
      }

      await unit.update({ status: 'sold' }, { transaction });

      await this.SaleClientHistory.create(
        {
          sale_id: sale.sale_id,
          client_id: body.client_id,
        },
        { transaction },
      );
      return sale;
    });
  }

  async createAll({
    body,
    currentUser,
  }: {
    body: CreateAllDto;
    currentUser: CurrentUserDto;
  }) {
    const project_id = body.project_id;
    const unit_ids = body.unit_ids;

    const units = await this.unit.findAll({
      where: {
        unit_id: unit_ids,
        is_active: true,
      },
    });

    return await this.sequelize.transaction(async (transaction) => {
      const values: CreateAllDto[] = _.map(units, (unit) => {
        return {
          project_id,
          client_id: body.client_id,
          unit_id: unit.unit_id,
          seller_id: body.seller_id,
          price: unit.price,
          commission: body.commission,
          create_by: currentUser.user_id,
        };
      });

      const sales = await this.model.bulkCreate(values, { transaction });

      await this.unit.update(
        { status: 'sold' },
        { where: { unit_id: unit_ids }, transaction },
      );

      const seller_id = body.seller_id;
      if (seller_id) {
        for (let i = 0; i < sales.length; i++) {
          const sale = sales[i];
          await createNotifications({
            seller_id: seller_id,
            commission: body.commission,
            create_by: currentUser.user_id,
            sale_id: sale.sale_id,
            transaction,
            Notification: this.Notification,
            Contact: this.Contact,
          });

          await this.SaleClientHistory.create(
            {
              sale_id: sale.sale_id,
              client_id: body.client_id,
            },
            { transaction },
          );
        }
      }
      return sales;
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
        ...StatusCodes.NotFound,
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
    if (!model || !model.is_active) {
      return {
        ...StatusCodes.NotFound,
      };
    }

    return await onFullCancellation({
      isPaymentDelete: false,
      notes: body.notes,
      user_id: currentUser.user_id,
      sequelize: this.sequelize,
      Notification: this.Notification,
      PaymentPlan: this.PaymentPlan,
      PaymentPlanDetail: this.PaymentPlanDetail,
      Payment: this.Payment,
      Project: this.Project,
      Unit: this.unit,
      sale_id: model.sale_id,
      isSale: true,
      Sale: this.model,
    });
  }
}
