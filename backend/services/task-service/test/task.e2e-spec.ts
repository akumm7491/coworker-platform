import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TaskStatus, TaskPriority } from '../src/domain/models/TaskStatus';
import { randomUUID } from 'crypto';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Task } from '../src/domain/models/Task';
import { typeOrmConfig } from '../src/config/typeorm.config';

jest.setTimeout(30000); // Increase timeout to 30 seconds

describe('TaskController (e2e)', () => {
  let app: INestApplication;
  let testTask: any;
  const userId = randomUUID();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRoot(typeOrmConfig),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  }, 30000); // Add timeout here as well

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /tasks', () => {
    it('should create a new task', async () => {
      const createTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        createdById: userId,
        priority: TaskPriority.HIGH,
        labels: ['test', 'e2e'],
      };

      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send(createTaskDto)
        .expect(201);

      testTask = response.body;
      expect(testTask).toHaveProperty('id');
      expect(testTask.title).toBe(createTaskDto.title);
      expect(testTask.description).toBe(createTaskDto.description);
      expect(testTask.createdById).toBe(createTaskDto.createdById);
      expect(testTask.priority).toBe(createTaskDto.priority);
      expect(testTask.labels).toEqual(createTaskDto.labels);
    });

    it('should fail to create a task without required fields', async () => {
      const invalidTask = {
        description: 'Missing required fields',
      };

      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send(invalidTask)
        .expect(400);

      expect(response.body.message).toContain('title should not be empty');
      expect(response.body.message).toContain('title must be longer than or equal to 3 characters');
      expect(response.body.message).toContain('createdById must be a UUID');
    });
  });

  describe('GET /tasks', () => {
    it('should return a list of tasks', async () => {
      const response = await request(app.getHttpServer()).get('/tasks').expect(200);

      expect(response.body).toHaveProperty('tasks');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.tasks)).toBe(true);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks')
        .query({ status: TaskStatus.TODO })
        .expect(200);

      expect(response.body.tasks.every((task: Task) => task.status === TaskStatus.TODO)).toBe(true);
    });
  });

  describe('GET /tasks/:taskId', () => {
    it('should return a specific task', async () => {
      const response = await request(app.getHttpServer()).get(`/tasks/${testTask.id}`).expect(200);

      expect(response.body.id).toBe(testTask.id);
      expect(response.body.title).toBe(testTask.title);
    });

    it('should return 404 for non-existent task', async () => {
      await request(app.getHttpServer()).get(`/tasks/${randomUUID()}`).expect(404);
    });
  });

  describe('PUT /tasks/:taskId', () => {
    it('should update a task', async () => {
      const updateData = {
        title: 'Updated Task Title',
        status: TaskStatus.IN_PROGRESS,
      };

      const response = await request(app.getHttpServer())
        .put(`/tasks/${testTask.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.status).toBe(updateData.status);
    });

    it('should return 404 for updating non-existent task', async () => {
      await request(app.getHttpServer())
        .put(`/tasks/${randomUUID()}`)
        .send({ title: 'Updated Title' })
        .expect(404);
    });
  });

  describe('DELETE /tasks/:taskId', () => {
    it('should delete a task', async () => {
      await request(app.getHttpServer())
        .delete(`/tasks/${testTask.id}`)
        .send({ deletedById: userId })
        .expect(200);

      // Verify task is deleted
      await request(app.getHttpServer()).get(`/tasks/${testTask.id}`).expect(404);
    });

    it('should return 404 for deleting non-existent task', async () => {
      await request(app.getHttpServer())
        .delete(`/tasks/${randomUUID()}`)
        .send({ deletedById: userId })
        .expect(404);
    });
  });
});
