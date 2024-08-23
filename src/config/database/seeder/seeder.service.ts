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
  ) {}

  async seeder() {
    await Promise.race([
      this.createRoles(),
      this.createStatuses(),
      this.createContacts(),
      this.createPropertyFeatures(),
    ]);
    await this.createUsers();
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
        type: 'seller',
        first_name: 'seller',
        last_name: 'seller',
        email: 'seller@gmail.com',
        phone_number_1: '+18002003006',
        national_id: '1234564',
        nationality: 'Dominicana',
        contact_method: 'Facebook',
        date_of_birth: new Date(),
        marital_status: 'single',
      },
      {
        contact_id: 2,
        type: 'client',
        first_name: 'John',
        last_name: 'Doe',
        email: 'doe@gmail.com',
        phone_number_1: '+18002003004',
        national_id: '1234564',
        nationality: 'Dominicana',
        contact_method: 'Facebook',
        date_of_birth: new Date(),
        marital_status: 'single',
      },
    ];
    return this.Contact.bulkCreate(array, { ignoreDuplicates: true });
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
}
