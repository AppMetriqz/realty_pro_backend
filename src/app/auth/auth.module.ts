import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuardProviders } from '../../common/guards';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModel } from '../user/user.model';

@Module({
  imports: [
    SequelizeModule.forFeature([UserModel]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get('JWT_SECRET_KEY'),
        verifyOptions: { ignoreExpiration: true },
        signOptions: { expiresIn: configService.get('JWT_EXPIRATION') },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, ...AuthGuardProviders],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
