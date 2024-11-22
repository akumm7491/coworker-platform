import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../guards/auth.guard';
import { BaseService } from '../service/base.service';
import { AggregateRoot } from '@coworker/shared/dist/database/base/AggregateRoot';
import { PaginatedResponse } from '../interfaces/paginated-response.interface';
import { PaginationParams } from '../interfaces/pagination-params.interface';

@Controller()
@UseGuards(AuthGuard)
@ApiBearerAuth()
export abstract class BaseController<T extends AggregateRoot> {
  constructor(protected readonly service: BaseService<T>) {}

  @Get()
  @ApiOperation({ summary: 'Get all entities' })
  @ApiResponse({ status: 200, description: 'Returns a paginated list of entities' })
  async findAll(
    @Query(new ValidationPipe({ transform: true })) params: PaginationParams
  ): Promise<PaginatedResponse<T>> {
    return this.service.findAll(params);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get entity by id' })
  @ApiResponse({ status: 200, description: 'Returns the entity' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<T> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new entity' })
  @ApiResponse({ status: 201, description: 'Entity created successfully' })
  async create(@Body(new ValidationPipe()) dto: any): Promise<T> {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update entity' })
  @ApiResponse({ status: 200, description: 'Entity updated successfully' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe()) dto: any
  ): Promise<T> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete entity' })
  @ApiResponse({ status: 200, description: 'Entity deleted successfully' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.delete(id);
  }
}
