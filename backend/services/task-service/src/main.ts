import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation pipes globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    })
  );

  // Enable CORS
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Task Service is running on port ${port}`);
}

bootstrap();
