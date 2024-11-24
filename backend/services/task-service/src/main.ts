import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DomainErrorFilter } from './infrastructure/filters/DomainErrorFilter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation pipes globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    })
  );

  // Apply global exception filter
  app.useGlobalFilters(new DomainErrorFilter());

  // Enable CORS
  app.enableCors();

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Task Service API')
    .setDescription('API documentation for the Task Management Service')
    .setVersion('1.0.0')
    .addTag('tasks')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'Task Service API Documentation'
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Task Service is running on port ${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/swagger`);
}

bootstrap();
