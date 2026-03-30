import { Test } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [DashboardController],
    }).compile();
    controller = module.get(DashboardController);
  });

  it('should return empty dashboards with tenant scope', () => {
    const req = { user: { tenantId: 'tenant-1', sub: 'user-1', email: 'a@b.com', role: 'VIEWER' } };
    const result = controller.findAll(req as never);

    expect(result.tenantId).toBe('tenant-1');
    expect(result.dashboards).toEqual([]);
  });
});
