import { NestFactory } from '@nestjs/core';
import { Logger, ConsoleLogger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'Kubero',
      //logLevels: ['log', 'error', 'warn', 'debug', 'verbose'],
    }),
  });

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

  Logger.warn(`⚡️[server]: Server is running at: ${await app.getUrl()}`, 'Bootstrap');
}
bootstrap();
