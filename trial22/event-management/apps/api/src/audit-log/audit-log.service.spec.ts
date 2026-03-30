import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  auditLog: { findMany: jest.fn(), create: jest.fn(), count: jest.fn() },
};

describe('AuditLogService', () => {
  let service: AuditLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditLogService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<AuditLogService>(AuditLogService);
    jest.clearAllMocks();
  });

  it('should return paginated audit logs', async () => {
    mockPrisma.auditLog.findMany.mockResolvedValue([{ id: '1', action: 'CREATE' }]);
    mockPrisma.auditLog.count.mockResolvedValue(1);
    const result = await service.findAll('t1', {});
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 't1' } }),
    );
  });

  it('should create audit log entry', async () => {
    const data = { action: 'CREATE', entity: 'Event', entityId: 'e1', userId: 'u1' };
    mockPrisma.auditLog.create.mockResolvedValue({ id: '1', ...data, tenantId: 't1' });
    const result = await service.create('t1', data);
    expect(result.id).toBe('1');
    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ tenantId: 't1', action: 'CREATE' }),
    });
  });
});
