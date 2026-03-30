// TRACED:AUDIT-CTRL-TEST — Audit log controller tests
import { AuditLogController } from './audit-log.controller';
import { AuditLogService } from './audit-log.service';
import { Request } from 'express';

describe('AuditLogController', () => {
  let controller: AuditLogController;
  let service: { findAll: jest.Mock };

  const mockReq = {
    user: { userId: 'u1', tenantId: 't1', email: 'a@b.com', role: 'ADMIN' },
  } as unknown as Request;

  beforeEach(() => {
    service = {
      findAll: jest.fn().mockResolvedValue({ data: [], meta: { total: 0 } }),
    };
    controller = new AuditLogController(
      service as unknown as AuditLogService,
    );
  });

  it('should list audit logs', async () => {
    const result = await controller.findAll(mockReq, { page: 1, limit: 10 });
    expect(result.data).toEqual([]);
    expect(result.meta).toBeDefined();
    expect(result.meta.total).toBe(0);
    expect(service.findAll).toHaveBeenCalledWith('t1', 1, 10);
  });
});
