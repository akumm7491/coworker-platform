import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { TaskNotFoundError } from '../../domain/errors/TaskNotFoundError';

@Catch(TaskNotFoundError)
export class TaskNotFoundFilter implements ExceptionFilter {
  catch(exception: TaskNotFoundError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.NOT_FOUND).json({
      statusCode: HttpStatus.NOT_FOUND,
      message: exception.message,
      timestamp: new Date().toISOString(),
      error: exception.name,
    });
  }
}
