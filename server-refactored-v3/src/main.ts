import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 2000); // Use port 2000 for compatibility with kubero v2

  console.log(`⚡️[server]: Server is running at: ${await app.getUrl()}`);
}
bootstrap();
