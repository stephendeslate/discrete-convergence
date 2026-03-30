import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AttendeeService } from './attendee.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  attendee: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('AttendeeService', () => {
  let service: AttendeeService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AttendeeService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(AttendeeService);
    jest.clearAllMocks();
  });

  it('should create an attendee with tenant scoping', async () => {
    mockPrisma.attendee.create.mockResolvedValue({ id: 'a-1', firstName: 'John', tenantId: 'tenant-1' });

    const result = await service.create(
      { firstName: 'John', lastName: 'Doe', email: 'john@test.com' },
      'tenant-1',
    );

    expect(mockPrisma.attendee.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ firstName: 'John', tenantId: 'tenant-1' }),
      }),
    );
    expect(result.id).toBe('a-1');
  });

  it('should find all attendees with tenant scoping', async () => {
    mockPrisma.attendee.findMany.mockResolvedValue([{ id: 'a-1' }]);
    mockPrisma.attendee.count.mockResolvedValue(1);

    const result = await service.findAll('tenant-1', 1, 10);

    expect(mockPrisma.attendee.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
    );
    expect(result.data).toHaveLength(1);
  });

  it('should find one attendee by id', async () => {
    mockPrisma.attendee.findUnique.mockResolvedValue({ id: 'a-1', tenantId: 'tenant-1' });

    const result = await service.findOne('a-1', 'tenant-1');

    expect(mockPrisma.attendee.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'a-1' } }),
    );
    expect(result.id).toBe('a-1');
  });

  it('should throw NotFoundException for non-existent attendee', async () => {
    mockPrisma.attendee.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing', 'tenant-1')).rejects.toThrow(NotFoundException);
    expect(mockPrisma.attendee.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'missing' } }),
    );
  });

  it('should update an attendee', async () => {
    mockPrisma.attendee.findUnique.mockResolvedValue({ id: 'a-1', tenantId: 'tenant-1' });
    mockPrisma.attendee.update.mockResolvedValue({ id: 'a-1', firstName: 'Jane' });

    const result = await service.update('a-1', { firstName: 'Jane' }, 'tenant-1');

    expect(mockPrisma.attendee.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'a-1' } }),
    );
    expect(result.firstName).toBe('Jane');
  });

  it('should delete an attendee', async () => {
    mockPrisma.attendee.findUnique.mockResolvedValue({ id: 'a-1', tenantId: 'tenant-1' });
    mockPrisma.attendee.delete.mockResolvedValue({ id: 'a-1' });

    await service.remove('a-1', 'tenant-1');

    expect(mockPrisma.attendee.delete).toHaveBeenCalledWith({ where: { id: 'a-1' } });
  });
});
