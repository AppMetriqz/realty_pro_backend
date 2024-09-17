import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'process';
import { HttpGlobalExceptionsFilter } from './common/exceptions';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { SeederModule } from './config/database/seeder/seeder.module';
import { SeederService } from './config/database/seeder/seeder.service';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';

async function bootstrap() {
  const corsOptions = {
    origin: [
      'https://realty-prop-frontend-783a5201eacf.herokuapp.com',
      'http://localhost:3000',
    ],
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
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
      },
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/api/v1/uploads/',
  });

  const config = new DocumentBuilder()
    .setTitle('Realty Pro swagger')
    .setDescription('Realty Pro')
    .setVersion('1.0')
    .build();

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new HttpGlobalExceptionsFilter(httpAdapter));

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/swagger', app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port);

  console.log('Version', '1.0.1');

  const appContext = await NestFactory.createApplicationContext(SeederModule);
  const seederService = appContext.get(SeederService);
  await seederService.seeder();
}

bootstrap();
