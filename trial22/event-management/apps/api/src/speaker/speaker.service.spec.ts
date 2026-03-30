import { Test, TestingModule } from '@nestjs/testing';
import { SpeakerService } from './speaker.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  speaker: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
};

describe('SpeakerService', () => {
  let service: SpeakerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpeakerService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<SpeakerService>(SpeakerService);
    jest.clearAllMocks();
  });

  it('should return paginated speakers with sessions', async () => {
    mockPrisma.speaker.findMany.mockResolvedValue([{ id: '1', sessions: [] }]);
    mockPrisma.speaker.count.mockResolvedValue(1);
    const result = await service.findAll('t1', { page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(mockPrisma.speaker.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ include: { sessions: true } }),
    );
  });

  it('should throw NotFoundException for wrong tenant', async () => {
    mockPrisma.speaker.findUnique.mockResolvedValue({ id: '1', tenantId: 'other' });
    await expect(service.findOne('1', 't1')).rejects.toThrow(NotFoundException);
  });

  it('should create speaker', async () => {
    const dto = { name: 'Jane', email: 'j@b.com' };
    mockPrisma.speaker.create.mockResolvedValue({ id: '1', ...dto, tenantId: 't1' });
    const result = await service.create('t1', dto);
    expect(result.id).toBe('1');
    expect(mockPrisma.speaker.create).toHaveBeenCalledWith({ data: { ...dto, tenantId: 't1' } });
  });
});
