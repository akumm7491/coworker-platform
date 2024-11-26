import { Controller, Post, Body, Get, Param, Put, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserCommand } from '../application/commands/CreateUserCommand';
import { UpdateUserRolesCommand } from '../application/commands/UpdateUserRolesCommand';
import { GetUserByIdQuery } from '../application/queries/GetUserByIdQuery';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async createUser(@Body() createUserDto: { email: string; password: string; firstName: string; lastName: string }) {
    return this.commandBus.execute(
      new CreateUserCommand(
        createUserDto.email,
        createUserDto.password,
        createUserDto.firstName,
        createUserDto.lastName
      )
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  async getUserById(@Param('id') id: string) {
    return this.queryBus.execute(new GetUserByIdQuery(id));
  }

  @Put(':id/roles')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user roles' })
  @ApiResponse({ status: 200, description: 'User roles updated successfully' })
  async updateUserRoles(
    @Param('id') id: string,
    @Body() updateRolesDto: { roles: string[] }
  ) {
    return this.commandBus.execute(new UpdateUserRolesCommand(id, updateRolesDto.roles));
  }
}
