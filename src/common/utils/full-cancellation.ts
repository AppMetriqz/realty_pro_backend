import { Sequelize } from 'sequelize-typescript';
import { NotificationModel } from '../../app/notification/notification.model';
import { PaymentPlanModel } from '../../app/payment-plan/payment-plan.model';
import { PaymentPlanDetailModel } from '../../app/payment-plan-detail/payment-plan-detail.model';
import { DateFormat } from '../constants';
import { createNotifications } from '../../app/payment-plan/payment-plan.core';
import { PaymentModel } from '../../app/payment/payment.model';
import { SaleModel } from '../../app/sale/sale.model';
import { UnitModel } from '../../app/unit/unit.model';
import { ProjectModel } from '../../app/project/project.model';

interface CancelPlanDto {
  user_id: number;
  isPaymentDelete: boolean;
  notes: string;
  sequelize: Sequelize;
  Notification: typeof NotificationModel;
  PaymentPlan: typeof PaymentPlanModel;
  PaymentPlanDetail: typeof PaymentPlanDetailModel;
  Payment: typeof PaymentModel;
  isSale?: boolean;
  isUnit?: boolean;
  isProject?: boolean;
  Sale?: typeof SaleModel;
  Unit?: typeof UnitModel;
  Project?: typeof ProjectModel;
  sale_id?: number;
  unit_id?: number | number[];
  project_id?: number;
  payment_plan_id?: number;
}

export const onFullCancellation = async ({
  payment_plan_id,
  isPaymentDelete,
  notes,
  sale_id,
  user_id,
  sequelize,
  Notification,
  PaymentPlan,
  PaymentPlanDetail,
  Payment,
  isSale,
  isUnit,
  isProject,
  Sale,
  Unit,
  Project,
  unit_id,
  project_id,
}: CancelPlanDto) => {
  const payment_plan_is_active = !isPaymentDelete;

  const where: {
    payment_plan_id?: number;
    sale_id?: number;
    unit_id?: number | number[];
    project_id?: number;
  } = {};

  const whereUnit: {
    project_id?: number;
    unit_id?: number | number[];
  } = {};

  const whereSale: {
    project_id?: number;
    unit_id?: number | number[];
    sale_id?: number;
  } = {};

  if (isProject) {
    where.project_id = project_id;
    whereUnit.project_id = project_id;
    whereSale.project_id = project_id;
  } else if (isUnit) {
    where.unit_id = unit_id;
    whereUnit.unit_id = unit_id;
    whereSale.unit_id = unit_id;
  } else if (isSale) {
    where.sale_id = sale_id;
    whereSale.sale_id = sale_id;
  } else {
    where.payment_plan_id = payment_plan_id;
  }

  return await sequelize.transaction(async (transaction) => {
    if (isProject) {
      await Project.update(
        {
          is_active: false,
          notes: notes,
          update_by: user_id,
        },
        {
          where: {
            project_id: project_id,
          },
          transaction,
        },
      );
    }

    if (isUnit || isProject) {
      await Unit.update(
        {
          is_active: false,
          notes: notes,
          update_by: user_id,
        },
        {
          where: {
            ...whereUnit,
          },
          transaction,
        },
      );
    }

    if (isSale || isUnit || isProject) {
      await Sale.update(
        {
          is_active: false,
          notes: notes,
          update_by: user_id,
        },
        {
          where: {
            ...whereSale,
          },
          transaction,
        },
      );
    }

    if (isSale && !isUnit && !isProject) {
      const sale = await Sale.findByPk(sale_id, { transaction });
      await Unit.update(
        {
          notes: notes,
          update_by: user_id,
          status: 'available',
        },
        {
          where: {
            unit_id: sale.unit_id,
          },
          transaction,
        },
      );
    }

    const values = {
      status: 'canceled',
      is_active: payment_plan_is_active,
      notes: notes,
      update_by: user_id,
    };

    const promise1 = PaymentPlan.update(values, {
      where: {
        ...where,
      },
      transaction,
    });

    const promise2 = PaymentPlanDetail.update(values, {
      where: {
        ...where,
      },
      transaction,
    });

    const promise3 = Payment.update(values, {
      where: {
        ...where,
      },
      transaction,
    });

    await Promise.allSettled([promise1, promise2, promise3]);

    const description1 = `Plan de pago se ha cancelado.`;
    const description2 = notes;

    await createNotifications({
      description1,
      description2,
      create_by: user_id,
      sale_id: sale_id,
      transaction,
      Notification: Notification,
      dateFormat: DateFormat,
    });

    return { message: 'deleted' };
  });
};
