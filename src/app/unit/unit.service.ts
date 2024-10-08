import { Injectable } from '@nestjs/common';
import { UnitModel } from './unit.model';
import { InjectModel } from '@nestjs/sequelize';
import {
  CreateDto,
  DeleteAllDto,
  DeleteDto,
  FindAllAutocompleteDto,
  FindAllDto,
  UpdateAllDto,
  UpdateDto,
} from './unit.dto';
import * as _ from 'lodash';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  getImageBase64,
  onRemoveCircularReferences,
  StatusCodes,
} from '../../common/constants';
import { CurrentUserDto } from '../../common/dto';
import * as fs from 'fs-extra';
import { UnitPropertyFeaturesModel } from '../unit-property-features/unit-property-features.model';
import { UnitPropertyFeaturesDto } from '../unit-property-features/unit-property-features.dto';
import { ProjectModel } from '../project/project.model';
import { SaleModel } from '../sale/sale.model';
import { onFullCancellation } from '../../common/utils/full-cancellation';
import { PaymentPlanModel } from '../payment-plan/payment-plan.model';
import { PaymentModel } from '../payment/payment.model';
import { PaymentPlanDetailModel } from '../payment-plan-detail/payment-plan-detail.model';
import { NotificationModel } from '../notification/notification.model';
import { ModelProperties } from './unit.core';
import { ContactModel } from '../contact/contact.model';
import { createNotifications } from '../sale/sale.core';
import { SaleClientHistoryModel } from '../sale-client-history/sale-client-history.model';
import * as sharp from 'sharp';
import { CloudinaryService } from 'nestjs-cloudinary';

@Injectable()
export class UnitService {
  constructor(
    @InjectModel(UnitModel) private readonly model: typeof UnitModel,
    @InjectModel(UnitPropertyFeaturesModel)
    private readonly unitPropertyFeatures: typeof UnitPropertyFeaturesModel,
    @InjectModel(ProjectModel) private readonly project: typeof ProjectModel,
    @InjectModel(SaleModel) private readonly Sale: typeof SaleModel,
    @InjectModel(PaymentPlanModel)
    private readonly PaymentPlan: typeof PaymentPlanModel,
    @InjectModel(PaymentModel) private readonly Payment: typeof PaymentModel,
    @InjectModel(PaymentPlanDetailModel)
    private readonly PaymentPlanDetail: typeof PaymentPlanDetailModel,
    @InjectModel(NotificationModel)
    private readonly Notification: typeof NotificationModel,
    @InjectModel(SaleClientHistoryModel)
    private readonly SaleClientHistory: typeof SaleClientHistoryModel,
    @InjectModel(ContactModel) private readonly Contact: typeof ContactModel,
    private sequelize: Sequelize,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(filters: FindAllDto) {
    const offset = _.toNumber(filters.pageIndex) * _.toNumber(filters.pageSize);
    const limit = _.toNumber(filters.pageSize);
    const sort_order = filters.sortOrder;
    const sort_by = filters.sortBy;
    const dateFrom = filters.dateFrom;
    const dateTo = filters.dateTo;
    const projectId = filters.projectId;
    const status = filters.status;
    const searchText = filters.searchText ?? '';

    let order = undefined;
    const where: {
      created_at?: any;
      status?: string[];
      project_id?: number;
      is_active: boolean;
    } = {
      is_active: true,
    };

    if (_.size(sort_order) > 0 && _.size(sort_by) > 0) {
      order = [[sort_by, sort_order]];
    }

    if (_.size(status) > 0) {
      where.status = status;
    }

    if (projectId > 0) {
      where.project_id = projectId;
    }

    if (_.size(dateFrom) > 0 && _.size(dateTo) > 0) {
      where.created_at = { [Op.between]: [dateFrom, dateTo] };
    }

    const result = await this.model.findAndCountAll({
      limit,
      offset,
      order,
      distinct: true,
      include: [
        {
          model: SaleModel,
          attributes: ['sale_id'],
          required: false,
          where: {
            is_active: true,
          },
        },
      ],
      where: {
        ...where,
        [Op.or]: [
          { name: { [Op.like]: `%${searchText}%` } },
          { description: { [Op.like]: `%${searchText}%` } },
        ],
      },
    });

    const rows = onRemoveCircularReferences(result.rows);

    return {
      count: result.count,
      rows: _.map(rows, (items) => {
        return {
          ...items,
        };
      }),
    };
  }

  async findAllAutocomplete(filters: FindAllAutocompleteDto) {
    const description = filters.description;
    const result = await this.model.findAll({
      limit: 10,
      order: [['name', 'ASC']],
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${description}%` } },
          { description: { [Op.like]: `%${description}%` } },
        ],
      },
    });

    return _.map(result, (items) => {
      return {
        ...items,
      };
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
    const data = model.get({ plain: true });

    const property_features = _.map(
      model.unit_property_feature,
      'property_features',
    );
    const property_feature_ids = _.map(
      property_features,
      'property_feature_id',
    );

    const { client } = _.pick(model.sale, 'client');
    const sale = _.pick(model.sale, 'sale_id');

    return {
      ..._.omit(data, ['unit_property_feature', 'sale']),
      sale: _.size(sale) > 0 ? sale : null,
      client: client ?? null,
      property_feature_ids,
      property_features,
    };
  }

  async create({
    body,
    currentUser,
    file,
  }: {
    body: CreateDto;
    currentUser: CurrentUserDto;
    file: Express.Multer.File;
  }) {
    body.create_by = currentUser.user_id;

    return this.sequelize.transaction(async (transaction) => {
      if (file) {
        const fileUpload = await this.cloudinaryService.uploadFile(file, {
          transformation: { quality: 100 },
        });
        body.cover_path = fileUpload.public_id;
        body.cover_name = fileUpload.name;
      }
      const model = await this.model.create(body, { transaction });

      const property_feature_ids = body.property_feature_ids;
      const unit_id = model.unit_id;

      if (_.size(property_feature_ids) > 0) {
        const propertyFeatures: UnitPropertyFeaturesDto[] =
          property_feature_ids.map((property_feature_id: number) => {
            return {
              property_feature_id: property_feature_id,
              project_id: body.project_id,
              unit_id: unit_id,
            };
          });

        await this.unitPropertyFeatures.bulkCreate(propertyFeatures, {
          transaction,
          ignoreDuplicates: true,
        });
      }

      if (body.status === 'sold') {
        const values = {
          project_id: body.project_id,
          unit_id: unit_id,
          client_id: 1,
          seller_id: 2,
          commission: 0,
          price: model.price,
          stage: 'separation',
          create_by: currentUser.user_id,
        };

        const sale = await this.Sale.create(values, { transaction });
        const seller_id = values?.seller_id;

        await createNotifications({
          seller_id: seller_id,
          commission: values.commission,
          create_by: currentUser.user_id,
          sale_id: sale.sale_id,
          transaction,
          Notification: this.Notification,
          Contact: this.Contact,
        });

        await this.SaleClientHistory.create(
          {
            sale_id: sale.sale_id,
            client_id: values.client_id,
            sale_type: 'sale',
            total_amount: sale.price,
          },
          { transaction },
        );

        return { ...sale.get({ plain: true }), sale };
      }

      return model;
    });
  }

  async update({
    id,
    body,
    currentUser,
    file,
  }: {
    id: number;
    body: UpdateDto;
    currentUser: CurrentUserDto;
    file: Express.Multer.File;
  }) {
    const model = await this.model.findByPk(id);
    if (!model) {
      return {
        ...StatusCodes.NotFound,
      };
    }

    if (model.status === 'sold') {
      return {
        ...StatusCodes.BadRequest,
        message: 'Esta unidad ya está vendida, no se puede editar.',
      };
    }

    const unit_id = id;
    const project_id = model.project_id;
    const property_feature_ids = body.property_feature_ids;

    return await this.sequelize.transaction(async (transaction) => {
      body.update_by = currentUser.user_id;

      if (file) {
        const cover_path = model.cover_path;
        await this.cloudinaryService.cloudinaryInstance.uploader.destroy(
          cover_path,
        );
        const fileUpload = await this.cloudinaryService.uploadFile(file, {
          transformation: { quality: 100 },
        });
        body.cover_path = fileUpload.public_id;
        body.cover_name = fileUpload.name;
      }

      const modelUpdated = await model.update(body, {
        transaction,
        where: { unit_id: unit_id },
      });

      const projectPropertyFeatures = await this.unitPropertyFeatures.findAll({
        where: { unit_id },
      });

      const current_property_feature_ids = _.map(
        projectPropertyFeatures,
        'property_feature_id',
      );

      const toCreate = _.difference(
        property_feature_ids,
        current_property_feature_ids,
      );
      const toDelete = _.difference(
        current_property_feature_ids,
        property_feature_ids,
      );

      const propertyFeatures: UnitPropertyFeaturesDto[] = toCreate.map(
        (property_feature_id: number) => {
          return {
            project_id: project_id,
            property_feature_id: property_feature_id,
            unit_id: unit_id,
          };
        },
      );

      await this.unitPropertyFeatures.destroy({
        where: {
          property_feature_id: toDelete,
          unit_id: unit_id,
        },
        transaction: transaction,
      });

      await this.unitPropertyFeatures.bulkCreate(propertyFeatures, {
        transaction,
        ignoreDuplicates: true,
      });

      return modelUpdated;
    });
  }

  async updateAll({
    id,
    body,
    currentUser,
  }: {
    id: number;
    body: UpdateAllDto;
    currentUser: CurrentUserDto;
  }) {
    const project_id = id;
    const unit_ids = body.unit_ids;
    // const property_feature_ids = body.property_feature_ids;

    const project = await this.project.findByPk(project_id);

    if (!project || !project.is_active) {
      return {
        ...StatusCodes.NotFound,
      };
    }

    const propertyType = project.getDataValue('type');
    const isPlot = propertyType === 'plot';

    return await this.sequelize.transaction(async (transaction) => {
      const values = {
        ...body,
        update_by: currentUser.user_id,
      };

      await this.model.update(values, {
        transaction,
        where: {
          unit_id: unit_ids,
          status: { [Op.notIn]: ['sold'] },
          type: { [isPlot ? Op.in : Op.notIn]: ['plot'] },
        },
      });

      if (isPlot) {
        const units = await this.model.findAll({
          raw: true,
          transaction,
          where: {
            unit_id: unit_ids,
          },
        });

        const plots = _.filter(units, { type: 'plot' });

        const plotsPrice = _.map(plots, (plot) => {
          return {
            unit_id: plot.unit_id,
            price: plot.meters_of_land * plot.price_per_meter,
          };
        });

        for (const plot of plotsPrice) {
          await this.model.update(
            { price: plot.price },
            {
              transaction,
              where: {
                project_id: project_id,
                unit_id: plot.unit_id,
              },
            },
          );
        }
      }

      return { message: 'updated' };
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

    return await onFullCancellation({
      isPaymentDelete: false,
      notes: body.notes,
      user_id: currentUser.user_id,
      sequelize: this.sequelize,
      Notification: this.Notification,
      PaymentPlan: this.PaymentPlan,
      PaymentPlanDetail: this.PaymentPlanDetail,
      Payment: this.Payment,
      Sale: this.Sale,
      Unit: this.model,
      Project: this.project,
      unit_id: id,
      isUnit: true,
    });
  }

  async removeAll({
    body,
    currentUser,
  }: {
    body: DeleteAllDto;
    currentUser: CurrentUserDto;
  }) {
    return await onFullCancellation({
      isPaymentDelete: false,
      notes: body.notes,
      user_id: currentUser.user_id,
      sequelize: this.sequelize,
      Notification: this.Notification,
      PaymentPlan: this.PaymentPlan,
      PaymentPlanDetail: this.PaymentPlanDetail,
      Payment: this.Payment,
      Sale: this.Sale,
      Unit: this.model,
      Project: this.project,
      unit_id: body.unit_ids,
      isUnit: true,
    });
  }
}
