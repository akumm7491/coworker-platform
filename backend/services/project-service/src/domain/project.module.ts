import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectRepository } from './repositories/project.repository';
import { ProjectController } from './controllers/project.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
  ],
  controllers: [ProjectController],
  providers: [ProjectRepository],
  exports: [ProjectRepository],
})
export class ProjectModule {}
