import { Injectable } from '@nestjs/common';
import { ProjectModel } from './project.model';
import { InjectModel } from '@nestjs/sequelize';
import {
  CreateDto,
  DeleteDto,
  FindAllAutocompleteDto,
  FindAllDto,
  UpdateDto,
} from './project.dto';
import * as _ from 'lodash';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  getImageBase64,
  onRemoveCircularReferences,
  StatusCodes,
} from '../../common/constants';
import { CurrentUserDto } from '../../common/dto';
import { ProjectPropertyFeaturesDto } from '../project-property-features/project-property-features.dto';
import { ProjectPropertyFeaturesModel } from '../project-property-features/project-property-features.model';
import { PaymentPlanDetailModel } from '../payment-plan-detail/payment-plan-detail.model';
import { UnitModel } from '../unit/unit.model';
import { PropertyFeaturesModel } from '../property-features/property-features.model';
import { SaleModel } from '../sale/sale.model';
import { DateTime } from 'luxon';
import { PaymentPlanModel } from '../payment-plan/payment-plan.model';
import { onFullCancellation } from '../../common/utils/full-cancellation';
import { NotificationModel } from '../notification/notification.model';
import { PaymentModel } from '../payment/payment.model';
import { CloudinaryService } from 'nestjs-cloudinary';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(ProjectModel) private readonly model: typeof ProjectModel,
    @InjectModel(ProjectPropertyFeaturesModel)
    private readonly projectPropertyFeatures: typeof ProjectPropertyFeaturesModel,
    @InjectModel(PaymentPlanDetailModel)
    private readonly PaymentPlanDetail: typeof PaymentPlanDetailModel,
    @InjectModel(UnitModel) private readonly Unit: typeof UnitModel,
    @InjectModel(SaleModel) private readonly Sale: typeof SaleModel,
    @InjectModel(NotificationModel)
    private readonly Notification: typeof NotificationModel,
    @InjectModel(PaymentModel) private readonly Payment: typeof PaymentModel,
    @InjectModel(PaymentPlanModel)
    private readonly PaymentPlan: typeof PaymentPlanModel,
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

    let order = undefined;
    const where: { is_active: boolean; created_at?: any } = { is_active: true };

    if (_.size(sort_order) > 0 && _.size(sort_by) > 0) {
      order = [[sort_by, sort_order]];
    }

    if (_.size(dateFrom) > 0 && _.size(dateTo) > 0) {
      where.created_at = { [Op.between]: [dateFrom, dateTo] };
    }

    const result = await this.model.findAndCountAll({
      limit,
      offset,
      order,
      where: { ...where },
      distinct: true,
      attributes: [
        ...Object.keys(this.model.getAttributes()),
        [
          Sequelize.literal(
            '(SELECT MIN(price) FROM units WHERE units.project_id = project.project_id)',
          ),
          'unit_from_price',
        ],
        [
          Sequelize.literal(
            '(SELECT MAX(price) FROM units WHERE units.project_id = project.project_id)',
          ),
          'unit_to_price',
        ],
      ],
    });

    const rows = onRemoveCircularReferences(result.rows);

    return {
      count: result.count,
      rows: _.map(rows, (items) => {
        return {
          ...items,
          cover: getImageBase64(items.cover as Buffer, items.cover_mimetype),
        };
      }),
    };
  }

  async summary({ id }: { id: number }) {
    const ProjectModel = await this.model.findByPk(id, {
      attributes: [
        ...Object.keys(this.model.getAttributes()),
        [
          Sequelize.literal(
            '(SELECT MIN(price) FROM units WHERE units.project_id = project.project_id)',
          ),
          'unit_from_price',
        ],
        [
          Sequelize.literal(
            '(SELECT MAX(price) FROM units WHERE units.project_id = project.project_id)',
          ),
          'unit_to_price',
        ],
      ],
      include: [
        {
          model: ProjectPropertyFeaturesModel,
          include: [
            {
              model: PropertyFeaturesModel,
              attributes: ['property_feature_id', 'description'],
            },
          ],
        },
      ],
    });

    const project = {
      ...ProjectModel.get({ plain: true }),
    };

    if (!project.is_active) {
      return {
        ...StatusCodes.NotFound,
      };
    }

    const promise1 = this.Unit.count({
      where: {
        project_id: id,
        status: 'available',
        is_active: true,
      },
    });

    const promise2 = this.Unit.count({
      where: {
        project_id: id,
        status: 'sold',
        is_active: true,
      },
    });

    const promise3 = this.Unit.count({
      where: {
        project_id: id,
        status: 'reserved',
        is_active: true,
      },
    });

    const promise4 = this.Unit.min('meters_of_land', {
      where: {
        project_id: id,
        is_active: true,
      },
    });

    const promise5 = this.Unit.max('meters_of_land', {
      where: {
        project_id: id,
        is_active: true,
      },
    });

    const [available, sold, reserved, unit_meters_from, unit_meters_to] =
      await Promise.allSettled([
        promise1,
        promise2,
        promise3,
        promise4,
        promise5,
      ]);

    const property_features = _.map(
      project.project_property_feature,
      'property_features',
    );

    const available_value =
      available.status === 'fulfilled' ? available.value : 0;
    const sold_value = sold.status === 'fulfilled' ? sold.value : 0;
    const reserved_value = reserved.status === 'fulfilled' ? reserved.value : 0;
    const unit_meters_from_value =
      unit_meters_from.status === 'fulfilled' ? unit_meters_from.value : 0;
    const unit_meters_to_value =
      unit_meters_to.status === 'fulfilled' ? unit_meters_to.value : 0;

    return {
      name: project.name,
      description: project.description,
      unit_from_price: project.unit_from_price,
      unit_to_price: project.unit_to_price,
      city: project.city,
      sector: project.sector,
      address: project.address,
      total_unit: _.sum([available_value, sold_value, reserved_value]),
      total_available_unit: available_value,
      total_sold_unit: sold_value,
      total_reserved_unit: reserved_value,
      unit_meters_from: unit_meters_from_value,
      unit_meters_to: unit_meters_to_value,
      currency_type: project.currency_type,
      country_code: project.country_code,
      cover_path: project.cover_path,
      cover_name: project.cover_name,
      property_features: property_features,
      type: project.type,
    };
  }

  async finance({ id }: { id: number }) {
    const payments_received_promise = this.PaymentPlanDetail.sum(
      'amount_paid',
      {
        where: {
          project_id: id,
          is_active: true,
          status: { [Op.notIn]: ['canceled'] },
        },
      },
    );

    const pending_payments_promise = this.PaymentPlanDetail.sum(
      'payment_amount',
      {
        where: {
          project_id: id,
          is_active: true,
          status: { [Op.in]: ['pending'] },
        },
      },
    );

    const total_capacity_promise = this.PaymentPlanDetail.sum(
      'payment_amount',
      {
        where: {
          project_id: id,
          sale_type: 'sale',
          is_active: true,
          status: { [Op.notIn]: ['canceled'] },
        },
      },
    );

    const available_promise = this.Unit.findAll({
      attributes: [
        [Sequelize.fn('sum', Sequelize.col('price')), 'amount'],
        [Sequelize.fn('count', Sequelize.col('project_id')), 'qty'],
      ],
      where: {
        project_id: id,
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
        project_id: id,
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
        project_id: id,
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
        project_id: id,
        created_at: { [Op.gte]: DateTime.now().minus({ month: 6 }).toJSDate() },
        is_active: true,
      },
      group: ['month', 'year'],
      order: [['month', 'ASC']],
    });

    const separations = await this.Sale.count({
      where: {
        project_id: id,
        is_active: true,
      },
    });

    const payment_plans_in_progress_promise = this.PaymentPlan.count({
      where: {
        project_id: id,
        status: ['pending', 'resold'],
        sale_type: 'sale',
        is_active: true,
      },
    });

    const payment_plans_completed_promise = this.PaymentPlan.count({
      where: {
        project_id: id,
        status: 'paid',
        sale_type: 'sale',
        is_active: true,
      },
    });

    const financed_promise = this.PaymentPlan.count({
      where: {
        project_id: id,
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

  async findAllAutocomplete(filters: FindAllAutocompleteDto) {
    const description = filters.description;
    const currencyType = filters.currencyType;
    const limit = filters.limit;

    const where: { currency_type?: string } = {};

    if (_.size(currencyType) > 0) {
      where.currency_type = currencyType;
    }

    return await this.model.findAll({
      raw: true,
      nest: true,
      limit: limit ?? 10,
      order: [['name', 'ASC']],
      where: {
        ...where,
        [Op.or]: [{ name: { [Op.like]: `%${description}%` } }],
      },
      attributes: [
        ...Object.keys(this.model.getAttributes()),
        [
          Sequelize.literal(
            '(SELECT MIN(price) FROM units WHERE units.project_id = project.project_id)',
          ),
          'unit_from_price',
        ],
        [
          Sequelize.literal(
            '(SELECT MAX(price) FROM units WHERE units.project_id = project.project_id)',
          ),
          'unit_to_price',
        ],
      ],
    });
  }

  async findOne({ id }: { id: number }) {
    const model = await this.model.findByPk(id, {
      include: [
        {
          model: ProjectPropertyFeaturesModel,
          include: [
            {
              model: PropertyFeaturesModel,
              attributes: ['property_feature_id', 'description'],
            },
          ],
        },
      ],
    });

    const data = model.get({ plain: true });

    if (!data.is_active) {
      return {
        ...StatusCodes.NotFound,
      };
    }

    const property_features = _.map(
      model.project_property_feature,
      'property_features',
    );
    const property_feature_ids = _.map(
      property_features,
      'property_feature_id',
    );

    return {
      ..._.omit(data, ['project_property_feature']),
      property_features,
      property_feature_ids,
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

    return await this.sequelize.transaction(async (transaction) => {
      if (!_.isEmpty(file)) {
        const fileUpload = await this.cloudinaryService.uploadFile(file, {
          transformation: { quality: 100 },
        });
        body.cover_path = fileUpload.url;
        body.cover_name = fileUpload.display_name;
      }
      const model = await this.model.create(body, { transaction });

      const property_feature_ids = body.property_feature_ids;
      const project_id = model.project_id;

      const propertyFeatures: ProjectPropertyFeaturesDto[] =
        property_feature_ids.map((property_feature_id: number) => {
          return {
            property_feature_id: property_feature_id,
            project_id: project_id,
          };
        });

      await this.projectPropertyFeatures.bulkCreate(propertyFeatures, {
        transaction,
        ignoreDuplicates: true,
      });

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
    if (!model.is_active) {
      return {
        ...StatusCodes.NotFound,
      };
    }

    const project_id = id;
    const property_feature_ids = body.property_feature_ids;

    return await this.sequelize.transaction(async (transaction) => {
      body.update_by = currentUser.user_id;

      if (file) {
        const fileUpload = await this.cloudinaryService.uploadFile(file, {
          transformation: { quality: 100 },
        });
        body.cover_path = fileUpload.url;
        body.cover_name = fileUpload.display_name;
      }

      const modelUpdated = await model.update(body, {
        transaction,
        where: { project_id: project_id },
      });

      const projectPropertyFeatures =
        await this.projectPropertyFeatures.findAll({
          where: { project_id },
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

      const propertyFeatures: ProjectPropertyFeaturesDto[] = toCreate.map(
        (property_feature_id: number) => {
          return {
            property_feature_id: property_feature_id,
            project_id: project_id,
          };
        },
      );

      await this.projectPropertyFeatures.destroy({
        where: {
          property_feature_id: toDelete,
          project_id: project_id,
        },
        transaction: transaction,
      });

      await this.projectPropertyFeatures.bulkCreate(propertyFeatures, {
        transaction,
        ignoreDuplicates: true,
      });

      return modelUpdated;
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
      Project: this.model,
      project_id: id,
      Sale: this.Sale,
      Unit: this.Unit,
      isProject: true,
    });
  }
}
