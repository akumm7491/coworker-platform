import { DynamicModule, Module } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export interface SwaggerConfig {
  title: string;
  description: string;
  version: string;
  path?: string;
  tags?: string[];
}

@Module({})
export class ApiDocumentationModule {
  static setup(app: INestApplication, config: SwaggerConfig): void {
    const options = new DocumentBuilder()
      .setTitle(config.title)
      .setDescription(config.description)
      .setVersion(config.version)
      .addBearerAuth();

    if (config.tags) {
      config.tags.forEach(tag => options.addTag(tag));
    }

    const document = SwaggerModule.createDocument(app, options.build());
    SwaggerModule.setup(config.path || 'api-docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }
}
