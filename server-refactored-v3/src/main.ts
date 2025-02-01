import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Kubero')
    .setDescription('Kubero is a web-based tool deploy applications on a Kubernetes clusters. It provides a simple and intuitive interface to manage your clusters, applications, and pipelines.')
    .setVersion('3.0')
    .addTag('Apps')
    .addTag('Addons')
    .addTag('Config')
    .addTag('Pipeline')
    .addTag('Settings')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);


  await app.listen(process.env.PORT ?? 2000); // Use port 2000 for compatibility with kubero v2

  console.log(`⚡️[server]: Server is running at: ${await app.getUrl()}`);
}
bootstrap();
