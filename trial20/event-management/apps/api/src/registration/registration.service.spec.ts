import { Test } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  registration: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  event: {
    findUnique: jest.fn(),
  },
};

describe('RegistrationService', () => {
  let service: RegistrationService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RegistrationService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(RegistrationService);
    jest.clearAllMocks();
  });

  it('should create a registration when event is published and not full', async () => {
    mockPrisma.registration.findFirst.mockResolvedValue(null);
    mockPrisma.event.findUnique.mockResolvedValue({
      id: 'e-1',
      tenantId: 'tenant-1',
      status: 'PUBLISHED',
      maxAttendees: 100,
      registrations: [],
    });
    mockPrisma.registration.create.mockResolvedValue({ id: 'r-1', status: 'CONFIRMED' });

    const result = await service.create({ eventId: 'e-1', attendeeId: 'a-1' }, 'tenant-1');

    expect(mockPrisma.registration.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ eventId: 'e-1', attendeeId: 'a-1', tenantId: 'tenant-1' }),
      }),
    );
    expect(result.status).toBe('CONFIRMED');
  });

  it('should throw ConflictException if already registered', async () => {
    mockPrisma.registration.findFirst.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create({ eventId: 'e-1', attendeeId: 'a-1' }, 'tenant-1'),
    ).rejects.toThrow(ConflictException);
    expect(mockPrisma.registration.findFirst).toHaveBeenCalled();
  });

  it('should throw NotFoundException if event not found', async () => {
    mockPrisma.registration.findFirst.mockResolvedValue(null);
    mockPrisma.event.findUnique.mockResolvedValue(null);

    await expect(
      service.create({ eventId: 'missing', attendeeId: 'a-1' }, 'tenant-1'),
    ).rejects.toThrow(NotFoundException);
    expect(mockPrisma.event.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'missing' } }),
    );
  });

  it('should throw BadRequestException if event not published', async () => {
    mockPrisma.registration.findFirst.mockResolvedValue(null);
    mockPrisma.event.findUnique.mockResolvedValue({
      id: 'e-1',
      tenantId: 'tenant-1',
      status: 'DRAFT',
      maxAttendees: 100,
      registrations: [],
    });

    await expect(
      service.create({ eventId: 'e-1', attendeeId: 'a-1' }, 'tenant-1'),
    ).rejects.toThrow(BadRequestException);
    expect(mockPrisma.event.findUnique).toHaveBeenCalled();
  });

  it('should waitlist when event is full', async () => {
    mockPrisma.registration.findFirst.mockResolvedValue(null);
    mockPrisma.event.findUnique.mockResolvedValue({
      id: 'e-1',
      tenantId: 'tenant-1',
      status: 'PUBLISHED',
      maxAttendees: 1,
      registrations: [{ status: 'CONFIRMED' }],
    });
    mockPrisma.registration.create.mockResolvedValue({ id: 'r-1', status: 'WAITLISTED' });

    const result = await service.create({ eventId: 'e-1', attendeeId: 'a-1' }, 'tenant-1');

    expect(mockPrisma.registration.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'WAITLISTED' }),
      }),
    );
    expect(result.status).toBe('WAITLISTED');
  });

  it('should find all registrations with tenant scoping', async () => {
    mockPrisma.registration.findMany.mockResolvedValue([{ id: 'r-1' }]);
    mockPrisma.registration.count.mockResolvedValue(1);

    const result = await service.findAll('tenant-1', 1, 10);

    expect(mockPrisma.registration.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
    );
    expect(result.data).toHaveLength(1);
  });

  it('should find one registration by id', async () => {
    mockPrisma.registration.findUnique.mockResolvedValue({ id: 'r-1', tenantId: 'tenant-1' });

    const result = await service.findOne('r-1', 'tenant-1');

    expect(mockPrisma.registration.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'r-1' } }),
    );
    expect(result.id).toBe('r-1');
  });

  it('should throw NotFoundException for non-existent registration', async () => {
    mockPrisma.registration.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing', 'tenant-1')).rejects.toThrow(NotFoundException);
    expect(mockPrisma.registration.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'missing' } }),
    );
  });

  it('should update a registration status', async () => {
    mockPrisma.registration.findUnique.mockResolvedValue({ id: 'r-1', tenantId: 'tenant-1' });
    mockPrisma.registration.update.mockResolvedValue({ id: 'r-1', status: 'CANCELLED' });

    const result = await service.update('r-1', { status: 'CANCELLED' }, 'tenant-1');

    expect(mockPrisma.registration.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'r-1' } }),
    );
    expect(result.status).toBe('CANCELLED');
  });

  it('should delete a registration', async () => {
    mockPrisma.registration.findUnique.mockResolvedValue({ id: 'r-1', tenantId: 'tenant-1' });
    mockPrisma.registration.delete.mockResolvedValue({ id: 'r-1' });

    await service.remove('r-1', 'tenant-1');

    expect(mockPrisma.registration.delete).toHaveBeenCalledWith({ where: { id: 'r-1' } });
  });
});
