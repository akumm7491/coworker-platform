import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { TerminusModule } from '@nestjs/terminus';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '../guards/auth.guard';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventStore } from '@coworker/shared/dist/events/store/EventStore';

export interface BaseModuleOptions {
  entities: any[];
  migrations?: any[];
  subscribers?: any[];
  imports?: any[];
  providers?: any[];
  controllers?: any[];
}

@Module({})
export class BaseModule {
  static forRoot(options: BaseModuleOptions): DynamicModule {
    return {
      module: BaseModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env.local', '.env'],
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_DATABASE'),
            entities: options.entities,
            migrations: options.migrations,
            subscribers: options.subscribers,
            synchronize: configService.get('NODE_ENV') !== 'production',
            logging: configService.get('NODE_ENV') !== 'production',
          }),
          inject: [ConfigService],
        }),
        LoggerModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            pinoHttp: {
              level: configService.get('LOG_LEVEL', 'info'),
              transport:
                configService.get('NODE_ENV') !== 'production'
                  ? { target: 'pino-pretty' }
                  : undefined,
            },
          }),
          inject: [ConfigService],
        }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get('JWT_SECRET'),
            signOptions: {
              expiresIn: configService.get('JWT_EXPIRES_IN', '1d'),
            },
          }),
          inject: [ConfigService],
        }),
        EventEmitterModule.forRoot({
          wildcard: true,
          delimiter: '.',
          maxListeners: 20,
          verboseMemoryLeak: true,
        }),
        TerminusModule,
        ...(options.imports || []),
      ],
      providers: [AuthGuard, EventStore, ...(options.providers || [])],
      controllers: [...(options.controllers || [])],
      exports: [ConfigModule, TypeOrmModule, JwtModule, EventEmitterModule, EventStore, AuthGuard],
    };
  }
}
