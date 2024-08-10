import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import * as basicAuth from 'express-basic-auth';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './errors/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // add global filters for catching all exceptions comes from mongoose validator
  app.useGlobalFilters(new AllExceptionsFilter());

  const authOptions = {
    challenge: true,
    users: {
      movie: '123',
    },
    authorizeAsync: false,
    unauthorizedResponse: 'Unauthorized',
  };
  app.use('/api', basicAuth(authOptions));
  const config = new DocumentBuilder()
    .setTitle('Movie API')
    .setDescription('Movie description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const whitelist = [
    //allow localhost
    'http://localhost:3050',
    //allow frontend to access
    //'https://movie.frontend.com',
  ];
  app.enableCors({
    origin: function (origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, origin);
      } else callback(new Error('Not allowed by CORS'));
    },

    credentials: true,
  });

  app.use(helmet());

  app.use(json({ limit: '50mb' }));

  app.use(urlencoded({ extended: true, limit: '50mb' }));

  await app.listen(3000);
}
bootstrap();
