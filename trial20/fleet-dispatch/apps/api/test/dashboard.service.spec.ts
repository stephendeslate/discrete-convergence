import { DashboardController } from '../src/dashboard/dashboard.controller';
import { RequestWithUser } from '../src/common/auth-utils';

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(() => {
    controller = new DashboardController();
  });

  it('should return empty array for findAll', () => {
    const req = { user: { sub: '1', email: 'e@t.com', role: 'ADMIN', tenantId: 't1' } } as RequestWithUser;
    const result = controller.findAll(req);
    expect(result).toEqual([]);
  });

  it('should accept any tenant context', () => {
    const req = { user: { sub: '2', email: 'o@t.com', role: 'VIEWER', tenantId: 't2' } } as RequestWithUser;
    const result = controller.findAll(req);
    expect(result).toEqual([]);
  });
});
