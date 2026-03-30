import { AuditLogService } from './audit-log.service';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let mockPrisma: Record<string, Record<string, jest.Mock>>;

  beforeEach(() => {
    mockPrisma = {
      auditLog: {
        findMany: jest.fn().mockResolvedValue([{ id: 'al-1', action: 'CREATE' }]),
        count: jest.fn().mockResolvedValue(1),
        create: jest.fn().mockResolvedValue({ id: 'al-new', action: 'UPDATE' }),
      },
    };
    service = new AuditLogService(mockPrisma as never);
  });

  it('should list audit logs with pagination', async () => {
    const result = await service.findAll('tenant-1', 1, 20);
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
    );
  });

  it('should create an audit log entry', async () => {
    const result = await service.create('tenant-1', 'user-1', 'UPDATE', 'Dashboard', 'dash-1', '{}');
    expect(result.id).toBe('al-new');
    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        tenantId: 'tenant-1',
        userId: 'user-1',
        action: 'UPDATE',
        entity: 'Dashboard',
        entityId: 'dash-1',
        metadata: '{}',
      },
    });
  });

  it('should use default pagination when not provided', async () => {
    await service.findAll('tenant-1');
    expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0 }),
    );
  });
});
