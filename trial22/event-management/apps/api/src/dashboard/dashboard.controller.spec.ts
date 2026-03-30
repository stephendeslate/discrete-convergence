import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { RequestWithUser } from '../common/request-with-user';

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return dashboard data scoped to tenant', () => {
    const req = { user: { tenantId: 'tenant-1', sub: 'user-1', role: 'ADMIN' } } as unknown as RequestWithUser;
    const result = controller.findAll(req);
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('tenantId', 'tenant-1');
    expect(Array.isArray(result.data)).toBe(true);
  });
});
