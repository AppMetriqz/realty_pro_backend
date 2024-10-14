import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'process';
import { HttpGlobalExceptionsFilter } from './common/exceptions';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { SeederModule } from './config/database/seeder/seeder.module';
import { SeederService } from './config/database/seeder/seeder.service';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';

  const origin = [
    'https://realtor.metriqz.com',
    'https://realty.metriqz.com',
    'https://realty-prop-frontend-783a5201eacf.herokuapp.com',
    'https://stage-frontend-a472ac81f8d5.herokuapp.com',
    'https://enc.metriqz.com',
  ];

  if (!isProduction) {
    origin.push('http://localhost:3000');
  }

  const corsOptions = {
    origin: origin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors(corsOptions);

  app.setGlobalPrefix('api/v1');

  app.use(cookieParser());

  app.use(
    session({
      secret: process.env.JWT_SECRET_KEY,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000 * 24,
        secure: isProduction,
        // httpOnly: true,
        sameSite: 'none',
        domain: '.herokuapp.com',
      },
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/api/v1/uploads/',
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new HttpGlobalExceptionsFilter(httpAdapter));

  const port = process.env.PORT || 5000;
  await app.listen(port);

  const appContext = await NestFactory.createApplicationContext(SeederModule);
  const seederService = appContext.get(SeederService);
  await seederService.seeder();
}

bootstrap();
