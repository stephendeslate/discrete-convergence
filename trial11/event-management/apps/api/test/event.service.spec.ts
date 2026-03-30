import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventService } from '../src/event/event.service';
import { PrismaService } from '../src/common/prisma.service';

describe('EventService', () => {
  let service: EventService;
  let prisma: {
    event: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
    $executeRaw: jest.Mock;
  };

  const testTenantId = '550e8400-e29b-41d4-a716-446655440000';

  const mockEvent = {
    id: 'event-1',
    title: 'Test Event',
    description: 'Test',
    status: 'DRAFT',
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-06-02'),
    venueId: 'venue-1',
    tenantId: testTenantId,
    createdAt: new Date(),
    updatedAt: new Date(),
    venue: { id: 'venue-1', name: 'Venue', address: '123 St', capacity: 100 },
  };

  beforeEach(async () => {
    prisma = {
      event: {
        create: jest.fn().mockResolvedValue(mockEvent),
        findMany: jest.fn().mockResolvedValue([mockEvent]),
        findUnique: jest.fn().mockResolvedValue(mockEvent),
        update: jest.fn().mockResolvedValue({ ...mockEvent, title: 'Updated' }),
        delete: jest.fn().mockResolvedValue(mockEvent),
        count: jest.fn().mockResolvedValue(1),
      },
      $executeRaw: jest.fn().mockResolvedValue(1),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
  });

  describe('create', () => {
    it('should create an event', async () => {
      const result = await service.create(testTenantId, {
        title: 'Test Event',
        startDate: '2025-06-01T00:00:00Z',
        endDate: '2025-06-02T00:00:00Z',
        venueId: 'venue-1',
      });

      expect(result.title).toBe('Test Event');
      expect(prisma.event.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ title: 'Test Event', tenantId: testTenantId }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated events', async () => {
      const result = await service.findAll(testTenantId, 1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(prisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: testTenantId },
          skip: 0,
          take: 20,
        }),
      );
    });

    it('should clamp page size to MAX_PAGE_SIZE', async () => {
      await service.findAll(testTenantId, 1, 500);

      expect(prisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      );
    });
  });

  describe('findOne', () => {
    it('should return an event by id', async () => {
      const result = await service.findOne(testTenantId, 'event-1');

      expect(result.id).toBe('event-1');
      expect(prisma.event.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'event-1' } }),
      );
    });

    it('should throw NotFoundException for non-existent event', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(service.findOne(testTenantId, 'not-found')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.event.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'not-found' } }),
      );
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      prisma.event.findUnique.mockResolvedValue({
        ...mockEvent,
        tenantId: 'other-tenant',
      });

      await expect(
        service.findOne(testTenantId, 'event-1'),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.event.findUnique).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an event', async () => {
      const result = await service.update(testTenantId, 'event-1', {
        title: 'Updated',
      });

      expect(result.title).toBe('Updated');
      expect(prisma.event.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'event-1' } }),
      );
    });
  });

  describe('remove', () => {
    it('should delete an event', async () => {
      const result = await service.remove(testTenantId, 'event-1');

      expect(result.id).toBe('event-1');
      expect(prisma.event.delete).toHaveBeenCalledWith({ where: { id: 'event-1' } });
    });
  });

  describe('countByStatus', () => {
    it('should execute raw query for status counts', async () => {
      await service.countByStatus(testTenantId);

      expect(prisma.$executeRaw).toHaveBeenCalled();
    });
  });
});
