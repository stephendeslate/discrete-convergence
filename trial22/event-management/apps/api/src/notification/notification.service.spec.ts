import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  notification: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
};

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<NotificationService>(NotificationService);
    jest.clearAllMocks();
  });

  it('should return paginated notifications', async () => {
    mockPrisma.notification.findMany.mockResolvedValue([{ id: '1' }]);
    mockPrisma.notification.count.mockResolvedValue(1);
    const result = await service.findAll('t1', {});
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should throw NotFoundException for wrong tenant', async () => {
    mockPrisma.notification.findUnique.mockResolvedValue({ id: '1', tenantId: 'other' });
    await expect(service.findOne('1', 't1')).rejects.toThrow(NotFoundException);
  });

  it('should create notification with type casting', async () => {
    const dto = { type: 'EMAIL', subject: 'Hello', body: 'World' };
    mockPrisma.notification.create.mockResolvedValue({ id: '1', ...dto, tenantId: 't1' });
    const result = await service.create('t1', dto);
    expect(result.id).toBe('1');
    expect(mockPrisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ type: 'EMAIL', tenantId: 't1' }),
    });
  });
});
