// TRACED:AUDIT-LOG-SERVICE-SPEC
import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { PrismaService } from '../infra/prisma.module';

const mockPrisma = {
  auditLog: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

describe('AuditLogService', () => {
  let service: AuditLogService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<AuditLogService>(AuditLogService);
  });

  describe('create', () => {
    it('should create an audit log entry', async () => {
      const entry = { id: 'al-1', action: 'CREATE', entity: 'Dashboard', entityId: 'd-1', userId: 'u-1', tenantId: 't-1' };
      mockPrisma.auditLog.create.mockResolvedValue(entry);

      const result = await service.create('CREATE', 'Dashboard', 'd-1', 'u-1', 't-1');
      expect(result).toEqual(entry);
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'CREATE',
          entity: 'Dashboard',
          entityId: 'd-1',
          userId: 'u-1',
          tenantId: 't-1',
        }),
      });
    });

    it('should create entry with details', async () => {
      const details = { oldName: 'A', newName: 'B' };
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'al-2' });

      await service.create('UPDATE', 'Dashboard', 'd-1', 'u-1', 't-1', details);
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ details }),
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated audit logs', async () => {
      const logs = [{ id: 'al-1' }];
      mockPrisma.auditLog.findMany.mockResolvedValue(logs);
      mockPrisma.auditLog.count.mockResolvedValue(1);

      const result = await service.findAll('t-1', 1, 20);
      expect(result.data).toEqual(logs);
      expect(result.meta.total).toBe(1);
    });

    it('should use default pagination when not provided', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.count.mockResolvedValue(0);

      const result = await service.findAll('t-1');
      expect(result.meta.page).toBeGreaterThanOrEqual(1);
    });
  });
});
