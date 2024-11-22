import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { Agent } from './domain/planning/entities/agent.entity';
import { Project } from './domain/planning/entities/project.entity';
import { Task } from './domain/planning/entities/task.entity';
import { PlanningModule } from './domain/planning/planning.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [Agent, Project, Task],
        synchronize: process.env.NODE_ENV !== 'production',
      }),
    }),
    PlanningModule,
  ],
})
export class AppModule {}
