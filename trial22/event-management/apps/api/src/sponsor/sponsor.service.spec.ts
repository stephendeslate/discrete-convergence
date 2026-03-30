import { Test, TestingModule } from '@nestjs/testing';
import { SponsorService } from './sponsor.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  sponsor: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
};

describe('SponsorService', () => {
  let service: SponsorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SponsorService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<SponsorService>(SponsorService);
    jest.clearAllMocks();
  });

  it('should return paginated sponsors', async () => {
    mockPrisma.sponsor.findMany.mockResolvedValue([{ id: '1' }]);
    mockPrisma.sponsor.count.mockResolvedValue(1);
    const result = await service.findAll('t1', {});
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should throw NotFoundException for wrong tenant', async () => {
    mockPrisma.sponsor.findUnique.mockResolvedValue({ id: '1', tenantId: 'other' });
    await expect(service.findOne('1', 't1')).rejects.toThrow(NotFoundException);
  });

  it('should create sponsor with tier casting', async () => {
    const dto = { name: 'Acme', amount: 5000, contactEmail: 'a@b.com', tier: 'GOLD' };
    mockPrisma.sponsor.create.mockResolvedValue({ id: '1', ...dto, tenantId: 't1' });
    const result = await service.create('t1', dto);
    expect(result.id).toBe('1');
    expect(mockPrisma.sponsor.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ tenantId: 't1', tier: 'GOLD' }),
    });
  });
});
