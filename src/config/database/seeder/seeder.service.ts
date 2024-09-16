import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { RoleModel } from '../../../app/role/role.model';
import { RoleDto } from '../../../app/role/role.dto';
import { StatusModel } from '../../../app/status/status.model';
import { StatusDto } from '../../../app/status/status.dto';
import { UserModel } from '../../../app/user/user.model';
import { UserDto } from '../../../app/user/user.dto';
import { ConfigService } from '@nestjs/config';
import { PasswordGuard } from '../../../common/guards';
import { PropertyFeaturesModel } from '../../../app/property-features/property-features.model';
import { PropertyFeaturesDto } from '../../../app/property-features/property-features.dto';
import { ContactModel } from '../../../app/contact/contact.model';
import { UnitModel } from '../../../app/unit/unit.model';
import { ProjectModel } from '../../../app/project/project.model';
import { CreateDto } from '../../../app/contact/contact.dto';
import { Sequelize } from 'sequelize-typescript';
import { CurrentPaymentPendingView } from '../../../app/view/current-payment-pending/current-payment-pending.model';
import { UnitSalePlanDetailsView } from '../../../app/view/unit-sale-plan-details/unit-sale-plan-details.model';

@Injectable()
export class SeederService {
  constructor(
    private configService: ConfigService,
    @InjectModel(RoleModel) private readonly role: typeof RoleModel,
    @InjectModel(StatusModel) private readonly status: typeof StatusModel,
    @InjectModel(UserModel) private readonly user: typeof UserModel,
    @InjectModel(ContactModel) private readonly Contact: typeof ContactModel,
    @InjectModel(UnitModel) private readonly Unit: typeof UnitModel,
    @InjectModel(ProjectModel) private readonly Project: typeof ProjectModel,
    @InjectModel(PropertyFeaturesModel)
    private readonly propertyFeatures: typeof PropertyFeaturesModel,
    private sequelize: Sequelize,
  ) {}

  async seeder() {
    await this.sequelize.sync({
      force: false,
      alter: true,
    });
    await Promise.race([
      this.createRoles(),
      this.createStatuses(),
      this.createContacts(),
      this.createPropertyFeatures(),
      this.createViewUnitSalePlan(),
      this.createViewPaymentPendingPlan(),
    ]);
    await this.createUsers();

    this.sequelize.addModels([
      CurrentPaymentPendingView,
      UnitSalePlanDetailsView,
    ]);

    console.log('seeder Ready');
  }

  async createRoles() {
    const array: RoleDto[] = [
      { role_id: 1, name: 'super admin' },
      { role_id: 2, name: 'admin' },
      { role_id: 3, name: 'executor' },
      { role_id: 4, name: 'visitor' },
    ];
    return this.role.bulkCreate(array, { ignoreDuplicates: true });
  }

  async createContacts() {
    const array: CreateDto[] = [
      {
        contact_id: 1,
        type: 'client',
        first_name: 'Sin asignar',
        last_name: '',
        email: 'sin_asignar@gmail.com',
        phone_number_1: '+18000000000',
        national_id: '00000000000',
        nationality: 'Dominicana',
        contact_method: 'Facebook',
        date_of_birth: new Date(),
        marital_status: 'single',
      },
      {
        contact_id: 2,
        type: 'seller',
        first_name: 'Realty',
        last_name: 'Dominicana',
        email: 'realty@gmail.com',
        phone_number_1: '+18002003001',
        national_id: '2222222222',
        nationality: 'Dominicana',
        contact_method: 'Facebook',
        date_of_birth: new Date(),
        marital_status: 'single',
      },
      {
        contact_id: 3,
        type: 'client',
        first_name: 'John',
        last_name: 'Doe',
        email: 'doe@gmail.com',
        phone_number_1: '+18002003002',
        national_id: '33333333333',
        nationality: 'Dominicana',
        contact_method: 'Facebook',
        date_of_birth: new Date(),
        marital_status: 'single',
      },
    ];
    return this.Contact.bulkCreate(array, {
      ignoreDuplicates: true,
      updateOnDuplicate: ['first_name', 'last_name', 'email'],
    });
  }

  async createStatuses() {
    const array: StatusDto[] = [
      { status_id: 1, name: 'active' },
      { status_id: 2, name: 'disabled' },
      { status_id: 3, name: 'deleted' },
    ];
    return this.status.bulkCreate(array, {
      ignoreDuplicates: true,
    });
  }

  async createPropertyFeatures() {
    const array: PropertyFeaturesDto[] = [
      {
        property_feature_id: 1,
        description: 'Calles de hormigón',
        type: 'all',
      },
      {
        property_feature_id: 2,
        description: 'Seguridad de la zona',
        type: 'all',
      },
    ];
    return this.propertyFeatures.bulkCreate(array, {
      ignoreDuplicates: true,
    });
  }

  async createUsers() {
    const adminEmail = this.configService.get<string>('ADMIN_USER_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_USER_PASSWORD');
    const array: UserDto[] = [
      {
        user_id: 1,
        role_id: 1,
        first_name: 'Super Admin',
        last_name: '',
        national_id: '00000000000',
        phone_number: '+18002003000',
        email: adminEmail,
        password: new PasswordGuard().hashPassword(adminPassword),
      },
    ];
    return this.user.bulkCreate(array, {
      ignoreDuplicates: true,
      updateOnDuplicate: ['user_id'],
    });
  }

  async createViewUnitSalePlan() {
    const View = 'Unit_Sale_Plan_Details';

    const payment_plan_id =
      "(SELECT payment_plan_id  from payment_plans WHERE payment_plans.unit_id = units.unit_id and sale_type = 'sale' and is_active = 1 and status in ('pending', 'paid'))";
    const payment_separation =
      "COALESCE((SELECT separation_amount from payment_plans WHERE payment_plans.unit_id = units.unit_id and sale_type = 'sale' and is_active = 1 and status in ('pending', 'paid')),0)";
    const payment_status =
      "(SELECT status from payment_plans WHERE payment_plans.unit_id = units.unit_id and sale_type = 'sale' and is_active = 1 and status in ('pending', 'paid'))";
    const stage =
      '(SELECT stage from sales WHERE sales.unit_id = units.unit_id and is_active = 1)';
    const total_additional_amount = `COALESCE((SELECT GREATEST((SUM(amount_paid) - SUM(payment_amount)),0) as total FROM payment_plan_details WHERE payment_plan_id = ${payment_plan_id}),0)`;
    const total_paid_amount = `COALESCE((SELECT SUM(amount_paid) FROM payment_plan_details WHERE payment_plan_id = ${payment_plan_id}),0)`;
    const total_paid_amount_separation = `COALESCE(((SELECT SUM(amount_paid) FROM payment_plan_details WHERE payment_plan_id = ${payment_plan_id}) + ${payment_separation}),0)`;

    const query = `CREATE OR REPLACE VIEW ${View} AS
    SELECT project_id, unit_id,
    (SELECT sale_id from sales WHERE sales.unit_id = units.unit_id and is_active = 1) as sale_id,
    (SELECT is_active from sales WHERE sales.unit_id = units.unit_id and is_active = 1) as sale_is_active,
    ${payment_plan_id} as payment_plan_id,
    status as unit_status, 
    name as unit_name, 
    ${stage} as stage, 
    ${payment_status} as payment_status,
    price as amount,
    ${payment_separation} as payment_separation,
    ${total_paid_amount} as total_paid_amount,
    ${total_paid_amount_separation} as total_paid_amount_separation,
    COALESCE((SELECT SUM(payment_amount) FROM payment_plan_details WHERE payment_plan_id = ${payment_plan_id}),0) as total_due_amount,
    COALESCE((SELECT GREATEST((SUM(payment_amount) - SUM(amount_paid)),0) as total FROM payment_plan_details WHERE payment_plan_id = ${payment_plan_id}),0) as total_pending_amount,
    ${total_additional_amount} as total_additional_amount,
    CASE WHEN ${stage} = 'payment_plan_completed' THEN price - ${total_paid_amount_separation} ELSE 0 END AS stat_payment_financing,
    CASE WHEN ${stage} = 'financed' THEN price + ${total_paid_amount_separation} ELSE ${total_paid_amount_separation} END AS stat_payment_received,
    CASE WHEN ${stage} = 'financed' THEN 0 ELSE price - ${total_paid_amount_separation} END AS stat_payment_pending
    FROM units where is_active = 1;`;
    await this.sequelize.query(query);
    console.log('Unit_Sale_Plan_Details CREATED');
  }

  async createViewPaymentPendingPlan() {
    const View = 'Current_Payment_Pending';
    const query = `CREATE OR REPLACE VIEW ${View} AS
        SELECT ppd.*
      FROM payment_plan_details ppd
      INNER JOIN (
          SELECT payment_plan_id, MIN(payment_date) as oldest_payment_date
          FROM payment_plan_details
          WHERE status = 'pending'
          GROUP BY payment_plan_id
      ) as oldest ON ppd.payment_plan_id = oldest.payment_plan_id 
      AND ppd.payment_date = oldest.oldest_payment_date`;
    await this.sequelize.query(query);
    console.log('Current_Payment_Pending CREATED');
  }
}
