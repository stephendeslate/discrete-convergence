import { Test, TestingModule } from '@nestjs/testing';
import { AttendeeService } from './attendee.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  attendee: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
};

describe('AttendeeService', () => {
  let service: AttendeeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AttendeeService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<AttendeeService>(AttendeeService);
    jest.clearAllMocks();
  });

  it('should return paginated attendees', async () => {
    mockPrisma.attendee.findMany.mockResolvedValue([{ id: '1', name: 'John' }]);
    mockPrisma.attendee.count.mockResolvedValue(1);
    const result = await service.findAll('t1', { page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should throw NotFoundException for wrong tenant', async () => {
    mockPrisma.attendee.findUnique.mockResolvedValue({ id: '1', tenantId: 'other' });
    await expect(service.findOne('1', 't1')).rejects.toThrow(NotFoundException);
  });

  it('should create attendee with tenant', async () => {
    const dto = { name: 'John', email: 'j@b.com' };
    mockPrisma.attendee.create.mockResolvedValue({ id: '1', ...dto, tenantId: 't1' });
    const result = await service.create('t1', dto);
    expect(result.id).toBe('1');
    expect(mockPrisma.attendee.create).toHaveBeenCalledWith({ data: { ...dto, tenantId: 't1' } });
  });
});
