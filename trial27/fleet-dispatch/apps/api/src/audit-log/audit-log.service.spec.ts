// TRACED: FD-API-009 — Audit log service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  auditLog: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
  },
};

describe('AuditLogService', () => {
  let service: AuditLogService;
  const tenantId = 'tenant-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated audit logs', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([{ id: 'a1' }]);
      mockPrisma.auditLog.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should return empty data when no audit logs exist', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.count.mockResolvedValue(0);

      const result = await service.findAll(tenantId);

      expect(result.data).toHaveLength(0);
    });
  });

  describe('log', () => {
    it('should create an audit log entry', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({
        id: 'a1',
        action: 'CREATE',
        entity: 'vehicle',
        entityId: 'v1',
      });

      const result = await service.log(tenantId, 'CREATE', 'vehicle', 'v1', 'user-1');

      expect(result.action).toBe('CREATE');
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });

    it('should handle null metadata', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'a2' });

      await service.log(tenantId, 'DELETE', 'driver', 'd1');

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ metadata: null }),
        }),
      );
    });

    it('should stringify metadata object', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'a3' });

      await service.log(tenantId, 'UPDATE', 'vehicle', 'v1', 'u1', { field: 'name' });

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ metadata: JSON.stringify({ field: 'name' }) }),
        }),
      );
    });
  });
});
