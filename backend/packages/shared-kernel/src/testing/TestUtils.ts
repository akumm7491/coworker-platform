import { Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { Test, TestingModule } from '@nestjs/testing';

export class TestUtils {
  static async createTestingModule(metadata: ModuleMetadata): Promise<TestingModule> {
    return Test.createTestingModule(metadata).compile();
  }

  static async getTestingModuleFixture<T>(
    moduleClass: Type<T>,
    imports: any[] = [],
    providers: any[] = []
  ): Promise<{ module: TestingModule; fixture: T }> {
    const module = await Test.createTestingModule({
      imports,
      providers: [moduleClass, ...providers],
    }).compile();

    const fixture = module.get<T>(moduleClass);
    return { module, fixture };
  }

  static createMockRepository<T = any>() {
    return {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        getMany: jest.fn(),
      })),
    };
  }
}
