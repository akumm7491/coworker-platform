import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateTaskCommand, UpdateTaskCommand, DeleteTaskCommand } from '../commands';
import { GetTaskQuery, GetTasksQuery } from '../queries';
import { CreateTaskDto, UpdateTaskDto } from '../dtos/task.dto';

@Controller('tasks')
export class TaskController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.commandBus.execute(new CreateTaskCommand(createTaskDto));
  }

  @Get(':id')
  async getTask(@Param('id') id: string) {
    return this.queryBus.execute(new GetTaskQuery(id));
  }

  @Get()
  async getTasks() {
    return this.queryBus.execute(new GetTasksQuery());
  }

  @Put(':id')
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.commandBus.execute(
      new UpdateTaskCommand(id, updateTaskDto),
    );
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteTaskCommand(id));
  }
}
