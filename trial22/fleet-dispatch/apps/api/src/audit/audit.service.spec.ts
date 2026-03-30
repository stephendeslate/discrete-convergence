import { Test } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../infra/prisma.service';

describe('AuditService', () => {
  let service: AuditService;
  let prisma: { auditLog: { findMany: jest.Mock; count: jest.Mock; create: jest.Mock } };

  beforeEach(async () => {
    prisma = { auditLog: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0), create: jest.fn() } };
    const module = await Test.createTestingModule({
      providers: [AuditService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(AuditService);
  });

  it('should be defined', () => { expect(service).toBeDefined(); });

  it('findAll returns paginated audit logs', async () => {
    prisma.auditLog.findMany.mockResolvedValue([{ id: 'al1' }]);
    prisma.auditLog.count.mockResolvedValue(1);
    const result = await service.findAll('t1');
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('create delegates to prisma with positional args', async () => {
    prisma.auditLog.create.mockResolvedValue({ id: 'al1' });
    await service.create('t1', 'u1', 'CREATE', 'Vehicle', 'v1', 'created vehicle');
    expect(prisma.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ action: 'CREATE', tenantId: 't1', userId: 'u1' }),
    }));
  });
});
