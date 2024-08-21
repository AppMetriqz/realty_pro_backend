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

async function bootstrap() {
  const corsOptions = {
    origin: '*',
  };

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: corsOptions,
  });

  app.setGlobalPrefix('api/v1');

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

  console.log('PORT', process.env.PORT);
  console.log('NODE_ENV', process.env.NODE_ENV);

  const appContext = await NestFactory.createApplicationContext(SeederModule);
  const seederService = appContext.get(SeederService);
  await seederService.seeder();
}

bootstrap();
