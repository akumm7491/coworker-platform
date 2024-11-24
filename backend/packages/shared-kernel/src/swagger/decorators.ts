import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

export interface ApiEndpointOptions {
  summary: string;
  description?: string;
  tags?: string[];
  responses?: {
    [key: number]: {
      description: string;
      type?: any;
    };
  };
  body?: {
    type: any;
    description?: string;
  };
  params?: {
    name: string;
    type: 'string' | 'number' | 'boolean';
    description?: string;
    required?: boolean;
  }[];
  queries?: {
    name: string;
    type: 'string' | 'number' | 'boolean';
    description?: string;
    required?: boolean;
  }[];
}

export function ApiEndpoint(options: ApiEndpointOptions) {
  const decorators = [
    ApiOperation({
      summary: options.summary,
      description: options.description,
    }),
  ];

  if (options.tags) {
    decorators.push(ApiTags(...options.tags));
  }

  if (options.responses) {
    Object.entries(options.responses).forEach(([status, config]) => {
      decorators.push(
        ApiResponse({
          status: parseInt(status),
          description: config.description,
          type: config.type,
        }),
      );
    });
  }

  if (options.body) {
    decorators.push(
      ApiBody({
        type: options.body.type,
        description: options.body.description,
      }),
    );
  }

  if (options.params) {
    options.params.forEach(param => {
      decorators.push(
        ApiParam({
          name: param.name,
          type: param.type,
          description: param.description,
          required: param.required !== false,
        }),
      );
    });
  }

  if (options.queries) {
    options.queries.forEach(query => {
      decorators.push(
        ApiQuery({
          name: query.name,
          type: query.type,
          description: query.description,
          required: query.required !== false,
        }),
      );
    });
  }

  return applyDecorators(...decorators);
}
