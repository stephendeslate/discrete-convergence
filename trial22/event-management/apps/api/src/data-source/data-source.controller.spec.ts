import { Test, TestingModule } from '@nestjs/testing';
import { DataSourceController } from './data-source.controller';
import { RequestWithUser } from '../common/request-with-user';

describe('DataSourceController', () => {
  let controller: DataSourceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataSourceController],
    }).compile();

    controller = module.get<DataSourceController>(DataSourceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return data sources scoped to tenant', () => {
    const req = { user: { tenantId: 'tenant-2', sub: 'user-2', role: 'ADMIN' } } as unknown as RequestWithUser;
    const result = controller.findAll(req);
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('tenantId', 'tenant-2');
    expect(Array.isArray(result.data)).toBe(true);
  });
});
