import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { TaskServiceModule } from './TaskServiceModule';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // Create the main HTTP application
  const app = await NestFactory.create(TaskServiceModule);
  const configService = app.get(ConfigService);

  // Enable validation
  app.useGlobalPipes(new ValidationPipe());

  // Connect to Kafka
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'task-service',
        brokers: configService.get<string>('KAFKA_BROKERS').split(','),
      },
      consumer: {
        groupId: 'task-service-consumer',
      },
    },
  });

  // Start all microservices (Kafka)
  await app.startAllMicroservices();

  // Start HTTP server
  const port = configService.get<number>('PORT', 3455);
  await app.listen(port);
  
  console.log(`Task service is running on port ${port}`);
}

bootstrap();
