import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from './session.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  session: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
};

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<SessionService>(SessionService);
    jest.clearAllMocks();
  });

  it('should return paginated sessions', async () => {
    mockPrisma.session.findMany.mockResolvedValue([{ id: '1' }]);
    mockPrisma.session.count.mockResolvedValue(1);
    const result = await service.findAll('t1', { page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should throw NotFoundException for null result', async () => {
    mockPrisma.session.findUnique.mockResolvedValue(null);
    await expect(service.findOne('x', 't1')).rejects.toThrow(NotFoundException);
  });

  it('should create session with date conversion', async () => {
    const dto = { title: 'Talk', startTime: '2026-01-01T10:00:00Z', endTime: '2026-01-01T11:00:00Z', eventId: 'e1' };
    mockPrisma.session.create.mockResolvedValue({ id: '1', ...dto, status: 'SCHEDULED' });
    const result = await service.create('t1', dto);
    expect(result.status).toBe('SCHEDULED');
    expect(mockPrisma.session.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ tenantId: 't1' }),
    });
  });
});
