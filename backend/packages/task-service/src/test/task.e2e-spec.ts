import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TaskServiceModule } from '../TaskServiceModule';
import { ConfigService } from '@nestjs/config';
import { TaskStatus, TaskPriority } from '../domain/types/task.types';

describe('TaskController (e2e)', () => {
  let app: INestApplication;
  let createdTaskId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TaskServiceModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a task', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Test Task',
        description: 'Test Description',
        priority: TaskPriority.MEDIUM,
        assignedTeamId: '123',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.title).toBe('Test Task');
        createdTaskId = res.body.id;
      });
  });

  it('should get a task by id', () => {
    return request(app.getHttpServer())
      .get(`/tasks/${createdTaskId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(createdTaskId);
        expect(res.body.title).toBe('Test Task');
      });
  });

  it('should update a task', () => {
    return request(app.getHttpServer())
      .put(`/tasks/${createdTaskId}`)
      .send({
        status: TaskStatus.IN_PROGRESS,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(createdTaskId);
        expect(res.body.status).toBe(TaskStatus.IN_PROGRESS);
      });
  });

  it('should delete a task', () => {
    return request(app.getHttpServer())
      .delete(`/tasks/${createdTaskId}`)
      .expect(200);
  });

  it('should not find a deleted task', () => {
    return request(app.getHttpServer())
      .get(`/tasks/${createdTaskId}`)
      .expect(404);
  });
});
