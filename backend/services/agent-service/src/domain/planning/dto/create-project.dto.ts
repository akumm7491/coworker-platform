import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

interface ProjectVision {
  goals: string[];
  constraints: string[];
  success_criteria: string[];
}

export class CreateProjectDto {
  @ApiProperty({
    description: 'The name of the project',
    example: 'AI Assistant Project',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'A detailed description of the project',
    example: 'Building an AI assistant to help with development tasks',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description: 'Project requirements list',
    example: ['Secure authentication', 'Real-time updates', 'API documentation'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  requirements!: string[];

  @ApiProperty({
    description: 'Project vision including goals, constraints, and success criteria',
    example: {
      goals: ['Improve development efficiency', 'Automate repetitive tasks'],
      constraints: ['Must be secure', 'Must be scalable'],
      success_criteria: ['Reduces development time by 30%', 'High user satisfaction'],
    },
  })
  @IsNotEmpty()
  vision!: ProjectVision;

  @ApiProperty({
    description: 'Additional metadata for the project',
    required: false,
    example: {
      priority_level: 'high',
      estimated_duration: '6 months',
    },
  })
  @IsOptional()
  metadata?: Record<string, unknown>;
}
