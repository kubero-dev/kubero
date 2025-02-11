import { NestFactory } from '@nestjs/core';
import { Logger, } from '@nestjs/common';
import { CustomConsoleLogger } from './logger/logger';
import { LogLevel } from '@nestjs/common/services/logger.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

import helmet from 'helmet';

import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {

  const logLevels = process.env.LOGLEVELS?.split(',') ?? ['log', 'fatal', 'error', 'warn', 'debug', 'verbose'];
  Logger.log(`Log levels: ${logLevels}`, 'Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: new CustomConsoleLogger({
      prefix: 'Kubero',
      logLevels: logLevels as LogLevel[],
    }),
    cors: true,
  });

  app.use(helmet());

  const config = new DocumentBuilder()
    .setTitle('Kubero')
    .setDescription('Kubero is a web-based tool deploy applications on a Kubernetes clusters. It provides a simple and intuitive interface to manage your clusters, applications, and pipelines.')
    .setVersion('3.0')
    .addServer('/', 'Local (default)')
    //.addServer('http://localhost:2000/', 'Local')
    .addSecurity('bearerAuth', {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .addSecurity('apiKey', {
      type: 'apiKey',
      name: 'api_key',
      in: 'header',
    })
    .addSecurity('oauth2', {
      type: 'oauth2',
      flows: {
        implicit: {
          authorizationUrl: 'http://example.org/api/oauth/dialog',
          scopes: {
            'write:pets': 'modify pets in your account',
            'read:pets': 'read your pets',
          },
        },
      },
    })
    //.addSecurityRequirements('bearerAuth')

    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);


  await app.listen(process.env.PORT ?? 2000); // Use port 2000 for compatibility with kubero v2

  Logger.log(`⚡️[server]: Server is running at: ${await app.getUrl()}`, 'Bootstrap');
}
bootstrap();
