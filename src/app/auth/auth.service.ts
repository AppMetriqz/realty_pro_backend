import { Injectable } from '@nestjs/common';
import { AuthDto } from './auth.dto';
import { JwtService } from '@nestjs/jwt';
import { PasswordGuard } from '../../common/guards';
import { UserModel } from '../user/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { StatusCodes } from '../../common/constants';
import { ModelProperties } from '../user/user.core';
import { Op } from 'sequelize';
import { getJwtPayload } from './auth.core';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel) private readonly userModel: typeof UserModel,
    private jwtService: JwtService,
  ) {}

  async signIn(authDto: AuthDto) {
    const user = await this.userModel.findOne({
      ...ModelProperties,
      attributes: undefined,
      where: { email: authDto.email, status_id: { [Op.in]: [1, 2] } },
    });

    if (!user) {
      return StatusCodes.NotFound;
    }

    if (user.status_id === 2) {
      return StatusCodes.UnAuthorized;
    }

    const isValidPassword = new PasswordGuard().checkPassword(
      authDto.password,
      user.password,
    );

    if (!isValidPassword) {
      return {
        ...StatusCodes.UnAuthorized,
        message: 'Invalid password',
      };
    }

    const payload = getJwtPayload(user);

    const token = await this.jwtService.signAsync(payload);

    return { token: token };
  }

  async user({ email }: { email: string }) {
    const user = await this.userModel.findOne({
      ...ModelProperties,
      where: { email, status_id: { [Op.in]: [1, 2] } },
    });
    if (!user) {
      return StatusCodes.NotFound;
    }

    if (user.status_id === 2) {
      return StatusCodes.UnAuthorized;
    }

    return user;
  }

  async refreshToken(user_id: number) {
    const user = await this.userModel.findOne({
      ...ModelProperties,
      attributes: undefined,
      where: { user_id },
    });

    const payload = getJwtPayload(user);
    const token = await this.jwtService.signAsync(payload);
    return { token: token };
  }
}
