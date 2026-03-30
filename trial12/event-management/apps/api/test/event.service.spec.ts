import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventService } from '../src/event/event.service';
import { PrismaService } from '../src/common/prisma.service';

// TRACED: EM-EVENT-005
describe('EventService', () => {
  let service: EventService;
  let prisma: {
    event: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
    $executeRaw: jest.Mock;
  };

  const tenantId = '550e8400-e29b-41d4-a716-446655440000';

  const mockEvent = {
    id: 'event-1',
    title: 'Test Event',
    description: 'A test event',
    startDate: new Date('2026-06-15'),
    endDate: new Date('2026-06-16'),
    status: 'DRAFT',
    capacity: 100,
    tenantId,
    venueId: 'venue-1',
    venue: { id: 'venue-1', name: 'Test Venue' },
  };

  beforeEach(async () => {
    prisma = {
      event: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      $executeRaw: jest.fn(),
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
      const createDto = {
        title: 'New Event',
        description: 'Description',
        startDate: '2026-06-15T09:00:00Z',
        endDate: '2026-06-16T17:00:00Z',
        capacity: 100,
        venueId: 'venue-1',
      };
      prisma.event.create.mockResolvedValue(mockEvent);

      const result = await service.create(tenantId, createDto);

      expect(result).toEqual(mockEvent);
      expect(prisma.event.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: createDto.title,
            tenantId,
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated events', async () => {
      prisma.event.findMany.mockResolvedValue([mockEvent]);
      prisma.event.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId, 1, 20);

      expect(result.items).toEqual([mockEvent]);
      expect(result.total).toBe(1);
      expect(prisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return an event by id', async () => {
      prisma.event.findFirst.mockResolvedValue(mockEvent);

      const result = await service.findOne(tenantId, 'event-1');

      expect(result).toEqual(mockEvent);
      expect(prisma.event.findFirst).toHaveBeenCalledWith({
        where: { id: 'event-1', tenantId },
        include: { venue: true, schedules: true, tickets: true },
      });
    });

    it('should throw NotFoundException when event not found', async () => {
      prisma.event.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.event.findFirst).toHaveBeenCalledWith({
        where: { id: 'nonexistent', tenantId },
        include: { venue: true, schedules: true, tickets: true },
      });
    });
  });

  describe('update', () => {
    it('should update an event', async () => {
      prisma.event.findFirst.mockResolvedValue(mockEvent);
      prisma.event.update.mockResolvedValue({ ...mockEvent, title: 'Updated' });

      const result = await service.update(tenantId, 'event-1', { title: 'Updated' });

      expect(result.title).toBe('Updated');
      expect(prisma.event.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'event-1' },
        }),
      );
    });

    it('should throw NotFoundException when updating nonexistent event', async () => {
      prisma.event.findFirst.mockResolvedValue(null);

      await expect(
        service.update(tenantId, 'nonexistent', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.event.findFirst).toHaveBeenCalledWith({
        where: { id: 'nonexistent', tenantId },
        include: { venue: true, schedules: true, tickets: true },
      });
    });
  });

  describe('remove', () => {
    it('should delete an event', async () => {
      prisma.event.findFirst.mockResolvedValue(mockEvent);
      prisma.event.delete.mockResolvedValue(mockEvent);

      const result = await service.remove(tenantId, 'event-1');

      expect(result).toEqual(mockEvent);
      expect(prisma.event.delete).toHaveBeenCalledWith({ where: { id: 'event-1' } });
    });

    it('should throw NotFoundException when deleting nonexistent event', async () => {
      prisma.event.findFirst.mockResolvedValue(null);

      await expect(service.remove(tenantId, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.event.findFirst).toHaveBeenCalledWith({
        where: { id: 'nonexistent', tenantId },
        include: { venue: true, schedules: true, tickets: true },
      });
    });
  });

  describe('getEventStats', () => {
    it('should return event stats using raw query', async () => {
      prisma.$executeRaw.mockResolvedValue(5);

      const result = await service.getEventStats(tenantId);

      expect(result.count).toBe(5);
      expect(prisma.$executeRaw).toHaveBeenCalled();
    });
  });
});
