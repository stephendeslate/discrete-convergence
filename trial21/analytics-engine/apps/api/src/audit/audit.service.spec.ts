import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../infra/prisma.service';

describe('AuditService', () => {
  let service: AuditService;
  let prisma: {
    auditLog: { create: jest.Mock; findMany: jest.Mock; count: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      auditLog: { create: jest.fn(), findMany: jest.fn(), count: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  it('should create audit log entry', async () => {
    prisma.auditLog.create.mockResolvedValue({ id: 'al1', action: 'CREATE' });
    const result = await service.log('t1', 'u1', 'CREATE', 'Dashboard', 'd1');
    expect(result.action).toBe('CREATE');
    expect(prisma.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ tenantId: 't1', action: 'CREATE', entity: 'Dashboard' }),
    }));
  });

  it('should find all audit logs with pagination', async () => {
    prisma.auditLog.findMany.mockResolvedValue([{ id: 'al1' }]);
    prisma.auditLog.count.mockResolvedValue(1);
    const result = await service.findAll('t1', 1, 10);
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });
});
