import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let prisma: {
    auditLog: { findMany: jest.Mock; count: jest.Mock; create: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      auditLog: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
  });

  describe('findAll', () => {
    it('should return paginated audit logs', async () => {
      prisma.auditLog.findMany.mockResolvedValue([{ id: 'log-1' }]);
      prisma.auditLog.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1');

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should return empty data when no logs exist', async () => {
      prisma.auditLog.findMany.mockResolvedValue([]);
      prisma.auditLog.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1');

      expect(result.data).toHaveLength(0);
    });
  });

  describe('create', () => {
    it('should create an audit log entry', async () => {
      const params = { tenantId: 'tenant-1', action: 'CREATE', entity: 'Event', entityId: 'e1' };
      prisma.auditLog.create.mockResolvedValue({ id: 'log-1', ...params });

      const result = await service.create(params);

      expect(result.id).toBe('log-1');
      expect(prisma.auditLog.create).toHaveBeenCalledWith({ data: params });
    });
  });
});
