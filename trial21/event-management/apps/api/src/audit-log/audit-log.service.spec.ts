import { Test } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  auditLog: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
  },
};

describe('AuditLogService', () => {
  let service: AuditLogService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(AuditLogService);
  });

  it('should return paginated audit logs', async () => {
    mockPrisma.auditLog.findMany.mockResolvedValue([{ id: 'al1' }]);
    mockPrisma.auditLog.count.mockResolvedValue(1);
    const result = await service.findAll('org1', 1, 20);
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should create an audit log entry', async () => {
    mockPrisma.auditLog.create.mockResolvedValue({ id: 'al1', action: 'CREATE' });
    const result = await service.create({
      action: 'CREATE', entityType: 'event', entityId: 'e1',
      userId: 'u1', organizationId: 'org1',
    });
    expect(result.action).toBe('CREATE');
  });
});
