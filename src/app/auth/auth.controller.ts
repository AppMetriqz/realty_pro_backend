import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseFilters,
  Get,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './auth.dto';
import { CatchException, HttpExceptionFilter } from '../../common/exceptions';
import { CurrentUser, Public } from '../../common/decorators';
import { ApiTags } from '@nestjs/swagger';
import * as _ from 'lodash';
import { ExceptionDto } from '../../common/dto/http-exception-filter.dto';
import { UserDto } from '../user/user.dto';
import { ConfigService } from '@nestjs/config';
import { CurrentUserDto } from '../../common/dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    readonly configService: ConfigService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseFilters(new HttpExceptionFilter())
  @Post('login')
  async signIn(@Body() authDto: AuthDto) {
    const response = await this.authService.signIn(authDto);
    const error = response as ExceptionDto;
    const token = response as { token: string };
    if (_.isNumber(error?.statusCode)) {
      return new CatchException().Error(error);
    }
    return token;
  }

  @UseFilters(new HttpExceptionFilter())
  @Get('user')
  async user(@Req() req: any, @CurrentUser() currentUser: CurrentUserDto) {
    const response: unknown = await this.authService.user(req.user);
    const error = response as ExceptionDto;
    const token = response as UserDto;
    if (_.isNumber(error?.statusCode)) {
      return new CatchException().Error(error);
    }
    return token;
  }
}
