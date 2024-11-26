import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/domain/models/User';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_DATABASE'),
            entities: [User],
            synchronize: true,
          }),
          inject: [ConfigService],
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    const config = new DocumentBuilder()
      .setTitle('Identity Service API')
      .setDescription('API documentation for the Identity Service')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users', () => {
    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe('test@example.com');
          expect(res.body.firstName).toBe('Test');
          expect(res.body.lastName).toBe('User');
          expect(res.body.roles).toEqual(['user']);
          expect(res.body.isEmailVerified).toBe(false);
        });
    });

    it('should get user profile', async () => {
      const createResponse = await request(app.getHttpServer()).post('/users').send({
        email: 'profile@example.com',
        password: 'password123',
        firstName: 'Profile',
        lastName: 'User',
      });

      const token = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'profile@example.com',
          password: 'password123',
        })
        .expect(200);

      return request(app.getHttpServer())
        .get(`/users/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${token.body.access_token}`)
        .expect(200)
        .expect(res => {
          expect(res.body.email).toBe('profile@example.com');
          expect(res.body.firstName).toBe('Profile');
          expect(res.body.lastName).toBe('User');
        });
    });
  });
});
