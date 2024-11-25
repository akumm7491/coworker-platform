import { NestFactory } from '@nestjs/core';
import { IdentityModule } from './IdentityModule';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(IdentityModule);
  
  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe());
  
  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3456'],
    credentials: true,
  });

  // Get port from environment or use default
  const port = process.env.PORT || 3458;
  
  await app.listen(port);
  console.log(`Identity service is running on port ${port}`);
}

bootstrap();
