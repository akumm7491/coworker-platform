import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { glob } from 'glob';
import { resolve } from 'path';
import { readFile } from 'fs/promises';
import logger from '../../../utils/logger.js';

export interface SwaggerOptions {
  title: string;
  version: string;
  description?: string;
  basePath?: string;
  tags?: Array<{
    name: string;
    description: string;
  }>;
  servers?: Array<{
    url: string;
    description: string;
  }>;
  securitySchemes?: Record<
    string,
    {
      type: string;
      scheme?: string;
      bearerFormat?: string;
      flows?: Record<string, any>;
    }
  >;
}

export class SwaggerService {
  private static instance: SwaggerService;
  private specs: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): SwaggerService {
    if (!SwaggerService.instance) {
      SwaggerService.instance = new SwaggerService();
    }
    return SwaggerService.instance;
  }

  async generateDocs(app: Express, serviceName: string, options: SwaggerOptions): Promise<void> {
    try {
      const serviceDir = resolve(process.cwd(), 'src/services', serviceName);
      const routeFiles = await glob('**/*Routes.ts', {
        cwd: serviceDir,
      });

      const apis = await Promise.all(
        routeFiles.map(async file => {
          const content = await readFile(resolve(serviceDir, file), 'utf-8');
          return this.extractRouteInfo(content, file);
        }),
      );

      const spec = swaggerJsdoc({
        definition: {
          openapi: '3.0.0',
          info: {
            title: options.title,
            version: options.version,
            description: options.description,
          },
          servers: options.servers || [
            {
              url: process.env.API_BASE_URL || 'http://localhost:3000',
              description: 'Development server',
            },
          ],
          tags: options.tags || [],
          components: {
            securitySchemes: options.securitySchemes || {
              bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
              },
            },
            schemas: await this.generateSchemas(serviceDir),
          },
          security: [{ bearerAuth: [] }],
        },
        apis: apis,
      });

      this.specs.set(serviceName, spec);

      // Mount Swagger UI
      app.use(
        `/api-docs/${serviceName}`,
        swaggerUi.serve,
        swaggerUi.setup(spec, {
          explorer: true,
          customCss: '.swagger-ui .topbar { display: none }',
        }),
      );

      logger.info(`Swagger documentation generated for ${serviceName}`);
    } catch (error) {
      logger.error('Error generating Swagger documentation:', error);
      throw error;
    }
  }

  getSpec(serviceName: string): any {
    return this.specs.get(serviceName);
  }

  private async extractRouteInfo(content: string, file: string): Promise<string[]> {
    // Extract JSDoc comments and route information
    const routes: string[] = [];
    const lines = content.split('\n');

    let currentJsDoc = '';
    let isCollectingJsDoc = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('/**')) {
        isCollectingJsDoc = true;
        currentJsDoc = line + '\n';
      } else if (isCollectingJsDoc) {
        currentJsDoc += line + '\n';
        if (line.endsWith('*/')) {
          isCollectingJsDoc = false;
          routes.push(currentJsDoc);
          currentJsDoc = '';
        }
      }
    }

    return routes;
  }

  private async generateSchemas(serviceDir: string): Promise<Record<string, any>> {
    const schemas: Record<string, any> = {};
    const interfaceFiles = await glob('**/*Interface.ts', {
      cwd: serviceDir,
    });

    for (const file of interfaceFiles) {
      const content = await readFile(resolve(serviceDir, file), 'utf-8');
      const extractedSchemas = this.extractSchemas(content);
      Object.assign(schemas, extractedSchemas);
    }

    return schemas;
  }

  private extractSchemas(content: string): Record<string, any> {
    const schemas: Record<string, any> = {};
    const interfaceRegex = /export\s+interface\s+(\w+)\s*{([^}]+)}/g;
    const propertyRegex = /(\w+)(\?)?:\s*([^;\n]+)/g;

    let match;
    while ((match = interfaceRegex.exec(content)) !== null) {
      const [, name, properties] = match;
      const schema: any = {
        type: 'object',
        properties: {},
        required: [],
      };

      let propertyMatch;
      while ((propertyMatch = propertyRegex.exec(properties)) !== null) {
        const [, propName, optional, propType] = propertyMatch;
        schema.properties[propName] = this.convertTypeToSwagger(propType.trim());
        if (!optional) {
          schema.required.push(propName);
        }
      }

      if (schema.required.length === 0) {
        delete schema.required;
      }

      schemas[name] = schema;
    }

    return schemas;
  }

  private convertTypeToSwagger(type: string): any {
    const typeMap: Record<string, any> = {
      string: { type: 'string' },
      number: { type: 'number' },
      boolean: { type: 'boolean' },
      Date: { type: 'string', format: 'date-time' },
      'string[]': { type: 'array', items: { type: 'string' } },
      'number[]': { type: 'array', items: { type: 'number' } },
      'boolean[]': { type: 'array', items: { type: 'boolean' } },
      any: { type: 'object' },
      object: { type: 'object' },
      Record: { type: 'object', additionalProperties: true },
    };

    return typeMap[type] || { $ref: `#/components/schemas/${type}` };
  }
}

export const swaggerService = SwaggerService.getInstance();
