// TRACED:AUDIT-LOG-CONTROLLER-SPEC
import { AuditLogController } from './audit-log.controller';
import { AuditLogService } from './audit-log.service';
import { Request } from 'express';
import { PaginatedQuery } from '../common/paginated-query';
import { AuthenticatedUser } from '../common/auth-utils';

describe('AuditLogController', () => {
  let controller: AuditLogController;
  let service: jest.Mocked<AuditLogService>;
  const user: AuthenticatedUser = { sub: 'u-1', email: 'a@b.com', role: 'ADMIN', tenantId: 't-1' };
  const req = { user } as unknown as Request;

  beforeEach(() => {
    service = {
      findAll: jest.fn().mockResolvedValue({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }),
    } as unknown as jest.Mocked<AuditLogService>;
    controller = new AuditLogController(service);
  });

  it('should find all audit logs with pagination', async () => {
    const query: PaginatedQuery = { page: 2, limit: 10 };
    const result = await controller.findAll(query, req);
    expect(service.findAll).toHaveBeenCalledWith('t-1', 2, 10);
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('meta');
  });

  it('should extract tenant from request', async () => {
    const query: PaginatedQuery = { page: 1, limit: 20 };
    await controller.findAll(query, req);
    expect(service.findAll).toHaveBeenCalledWith('t-1', expect.any(Number), expect.any(Number));
  });
});
