import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { AgentRole } from '@coworker/shared';

interface AgentPerformance {
  tasks_completed: number;
  avg_completion_time: number;
  success_rate: number;
  quality_score: number;
  collaboration_score: number;
}

interface AgentLearningModel {
  model_type: string;
  parameters: Record<string, unknown>;
  training_data: Array<{
    input: unknown;
    output: unknown;
    feedback: unknown;
  }>;
  version: string;
}

interface AgentWorkingMemory {
  context: Record<string, unknown>;
  short_term: Array<{
    timestamp: string;
    type: string;
    data: unknown;
  }>;
  long_term: Array<{
    category: string;
    knowledge: unknown;
    last_accessed: string;
  }>;
}

interface AgentCommunication {
  style: string;
  preferences: Record<string, string>;
  history: Array<{
    timestamp: string;
    type: string;
    content: string;
    metadata: Record<string, unknown>;
  }>;
}

export class CreateAgentDto {
  @ApiProperty({
    description: 'The name of the agent',
    example: 'Development Assistant',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'A detailed description of the agent',
    example: 'AI assistant specialized in development tasks and code review',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description: 'The role of the agent',
    enum: AgentRole,
    example: AgentRole.WORKER,
  })
  @IsEnum(AgentRole)
  @IsNotEmpty()
  role!: AgentRole;

  @ApiProperty({
    description: 'List of agent capabilities',
    example: ['code_review', 'task_planning', 'documentation'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  capabilities!: string[];

  @ApiProperty({
    description: 'Performance metrics of the agent',
    example: {
      tasks_completed: 0,
      avg_completion_time: 0,
      success_rate: 0,
      quality_score: 0,
      collaboration_score: 0,
    },
  })
  @IsNotEmpty()
  performance_metrics!: AgentPerformance;

  @ApiProperty({
    description: 'Learning model configuration',
    example: {
      model_type: 'transformer',
      parameters: {},
      training_data: [],
      version: '1.0.0',
    },
  })
  @IsNotEmpty()
  learning_model!: AgentLearningModel;

  @ApiProperty({
    description: 'Working memory configuration',
    example: {
      context: {},
      short_term: [],
      long_term: [],
    },
  })
  @IsNotEmpty()
  working_memory!: AgentWorkingMemory;

  @ApiProperty({
    description: 'Communication configuration',
    example: {
      style: 'professional',
      preferences: {},
      history: [],
    },
  })
  @IsNotEmpty()
  communication!: AgentCommunication;

  @ApiProperty({
    description: 'Additional metadata for the agent',
    required: false,
    example: {
      version: '1.0.0',
      created_by: 'system',
    },
  })
  @IsOptional()
  metadata?: Record<string, unknown>;
}
