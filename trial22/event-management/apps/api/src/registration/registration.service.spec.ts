import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationService } from './registration.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  registration: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
};

describe('RegistrationService', () => {
  let service: RegistrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegistrationService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<RegistrationService>(RegistrationService);
    jest.clearAllMocks();
  });

  it('should return paginated registrations', async () => {
    mockPrisma.registration.findMany.mockResolvedValue([{ id: '1' }]);
    mockPrisma.registration.count.mockResolvedValue(1);
    const result = await service.findAll('t1', { page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should throw NotFoundException for wrong tenant', async () => {
    mockPrisma.registration.findUnique.mockResolvedValue({ id: '1', tenantId: 'other' });
    await expect(service.findOne('1', 't1')).rejects.toThrow(NotFoundException);
  });

  it('should create registration with status casting', async () => {
    const dto = { eventId: 'e1', userId: 'u1' };
    mockPrisma.registration.create.mockResolvedValue({ id: '1', status: 'PENDING', tenantId: 't1' });
    const result = await service.create('t1', dto);
    expect(result.status).toBe('PENDING');
    expect(mockPrisma.registration.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ tenantId: 't1', eventId: 'e1' }),
    });
  });
});
