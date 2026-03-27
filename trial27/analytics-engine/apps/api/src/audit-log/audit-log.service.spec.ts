import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { PrismaService } from '../infra/prisma.service';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let prisma: {
    auditLog: {
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
    };
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
      const mockLog = { id: 'log-1', tenantId: 'tenant-1', action: 'CREATE', entity: 'Dashboard' };
      prisma.auditLog.findMany.mockResolvedValue([mockLog]);
      prisma.auditLog.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1');

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should pass pagination params correctly', async () => {
      prisma.auditLog.findMany.mockResolvedValue([]);
      prisma.auditLog.count.mockResolvedValue(0);

      await service.findAll('tenant-1', 2, 10);

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });
  });

  describe('create', () => {
    it('should create an audit log entry', async () => {
      const mockLog = {
        id: 'log-1',
        tenantId: 'tenant-1',
        action: 'CREATE',
        entity: 'Dashboard',
        entityId: 'dash-1',
      };
      prisma.auditLog.create.mockResolvedValue(mockLog);

      const result = await service.create('tenant-1', 'CREATE', 'Dashboard', 'dash-1');

      expect(result).toEqual(mockLog);
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });
});
