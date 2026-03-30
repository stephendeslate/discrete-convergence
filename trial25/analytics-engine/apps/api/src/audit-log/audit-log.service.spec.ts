// TRACED:AUDIT-SVC-TEST — Audit log service tests
import { AuditLogService } from './audit-log.service';
import { PrismaService } from '../infra/prisma.service';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let prisma: {
    auditLog: { findMany: jest.Mock; count: jest.Mock; create: jest.Mock };
  };

  beforeEach(() => {
    prisma = {
      auditLog: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
      },
    };
    service = new AuditLogService(prisma as unknown as PrismaService);
  });

  it('should return paginated audit logs', async () => {
    const result = await service.findAll('tenant-1', 1, 10);
    expect(result.data).toEqual([]);
    expect(result.meta).toBeDefined();
    expect(result.meta.total).toBe(0);
  });

  it('should create an audit log', async () => {
    prisma.auditLog.create.mockResolvedValue({ id: '1', action: 'CREATE' });
    const result = await service.create(
      'CREATE',
      'Dashboard',
      'd-1',
      'u-1',
      'tenant-1',
    );
    expect(result.action).toBe('CREATE');
    expect(result.id).toBe('1');
  });

  it('should throw for missing entity', async () => {
    await expect(
      service.create('CREATE', '', 'd-1', 'u-1', 'tenant-1'),
    ).rejects.toThrow('Entity and entityId are required');
  });
});
