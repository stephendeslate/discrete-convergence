import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventService } from './event.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  event: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $executeRaw: jest.fn(),
};

describe('EventService', () => {
  let service: EventService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(EventService);
    jest.clearAllMocks();
  });

  it('should create an event with tenant scoping', async () => {
    const mockEvent = { id: 'e-1', title: 'Test', tenantId: 'tenant-1' };
    mockPrisma.event.create.mockResolvedValue(mockEvent);

    const result = await service.create(
      {
        title: 'Test',
        startDate: '2025-06-01T00:00:00Z',
        endDate: '2025-06-01T12:00:00Z',
        maxAttendees: 100,
        ticketPrice: 25.00,
        venueId: 'v-1',
      },
      'tenant-1',
    );

    expect(mockPrisma.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ title: 'Test', tenantId: 'tenant-1' }),
      }),
    );
    expect(result).toBeDefined();
  });

  it('should find all events with tenant scoping and pagination', async () => {
    mockPrisma.event.findMany.mockResolvedValue([{ id: 'e-1' }]);
    mockPrisma.event.count.mockResolvedValue(1);

    const result = await service.findAll('tenant-1', 1, 10);

    expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
    );
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should find one event by id and tenant', async () => {
    mockPrisma.event.findUnique.mockResolvedValue({ id: 'e-1', tenantId: 'tenant-1' });

    const result = await service.findOne('e-1', 'tenant-1');

    expect(mockPrisma.event.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'e-1' } }),
    );
    expect(result.id).toBe('e-1');
  });

  it('should throw NotFoundException when event not found', async () => {
    mockPrisma.event.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing', 'tenant-1')).rejects.toThrow(NotFoundException);
    expect(mockPrisma.event.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'missing' } }),
    );
  });

  it('should throw NotFoundException when event belongs to different tenant', async () => {
    mockPrisma.event.findUnique.mockResolvedValue({ id: 'e-1', tenantId: 'other-tenant' });

    await expect(service.findOne('e-1', 'tenant-1')).rejects.toThrow(NotFoundException);
    expect(mockPrisma.event.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'e-1' } }),
    );
  });

  it('should update an event', async () => {
    mockPrisma.event.findUnique.mockResolvedValue({ id: 'e-1', tenantId: 'tenant-1' });
    mockPrisma.event.update.mockResolvedValue({ id: 'e-1', title: 'Updated' });

    const result = await service.update('e-1', { title: 'Updated' }, 'tenant-1');

    expect(mockPrisma.event.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'e-1' } }),
    );
    expect(result.title).toBe('Updated');
  });

  it('should delete an event', async () => {
    mockPrisma.event.findUnique.mockResolvedValue({ id: 'e-1', tenantId: 'tenant-1' });
    mockPrisma.event.delete.mockResolvedValue({ id: 'e-1' });

    await service.remove('e-1', 'tenant-1');

    expect(mockPrisma.event.delete).toHaveBeenCalledWith({ where: { id: 'e-1' } });
  });

  it('should execute raw tenant check', async () => {
    mockPrisma.$executeRaw.mockResolvedValue(1);

    const result = await service.executeRawTenantCheck('tenant-1');

    expect(mockPrisma.$executeRaw).toHaveBeenCalled();
    expect(result).toBe(1);
  });
});
