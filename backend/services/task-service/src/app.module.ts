import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskModule } from './TaskModule';
import { typeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [CqrsModule.forRoot(), TypeOrmModule.forRoot(typeOrmConfig), TaskModule],
})
export class AppModule {}
