import { AuditService } from './audit.service';
import { createMockPrisma, MockPrisma } from '../../test/helpers/mock-prisma';
import { TENANT_ID, COMPANY_ID } from '../../test/helpers/factories';

describe('AuditService', () => {
  let service: AuditService;
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new AuditService(prisma as never);
  });

  describe('findAll', () => {
    it('should return paginated audit logs', async () => {
      prisma.auditLog.findMany.mockResolvedValue([]);
      prisma.auditLog.count.mockResolvedValue(0);

      const result = await service.findAll(TENANT_ID, 1, 10);
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('create', () => {
    it('should create an audit log entry', async () => {
      prisma.auditLog.create.mockResolvedValue({
        id: 'audit-1',
        action: 'CREATE',
        entity: 'WorkOrder',
      });

      const result = await service.create(
        TENANT_ID,
        COMPANY_ID,
        'user-1',
        'CREATE',
        'WorkOrder',
        'wo-1',
      );

      expect(result.action).toBe('CREATE');
    });
  });
});
