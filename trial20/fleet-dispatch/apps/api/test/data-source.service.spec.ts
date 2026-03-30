import { DataSourceController } from '../src/data-source/data-source.controller';
import { RequestWithUser } from '../src/common/auth-utils';

describe('DataSourceController', () => {
  let controller: DataSourceController;

  beforeEach(() => {
    controller = new DataSourceController();
  });

  it('should return empty array for findAll', () => {
    const req = { user: { sub: '1', email: 'e@t.com', role: 'ADMIN', tenantId: 't1' } } as RequestWithUser;
    const result = controller.findAll(req);
    expect(result).toEqual([]);
  });

  it('should accept any tenant context', () => {
    const req = { user: { sub: '2', email: 'o@t.com', role: 'DISPATCHER', tenantId: 't3' } } as RequestWithUser;
    const result = controller.findAll(req);
    expect(result).toEqual([]);
  });
});
