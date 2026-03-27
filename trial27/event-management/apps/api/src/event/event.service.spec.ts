// TRACED: EM-API-003 — Event service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EventService } from './event.service';
import { PrismaService } from '../prisma/prisma.service';

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
  };

  const tenantId = 'tenant-1';
  const mockEvent = {
    id: 'event-1',
    tenantId,
    name: 'Test Event',
    description: 'A test event',
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-06-02'),
    status: 'DRAFT',
    venueId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
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
      prisma.event.create.mockResolvedValue(mockEvent);

      const result = await service.create(tenantId, {
        name: 'Test Event',
        description: 'A test event',
        startDate: '2025-06-01T00:00:00Z',
        endDate: '2025-06-02T00:00:00Z',
      });

      expect(result).toEqual(mockEvent);
    });

    it('should throw if end date is before start date', async () => {
      await expect(
        service.create(tenantId, {
          name: 'Test',
          startDate: '2025-06-02T00:00:00Z',
          endDate: '2025-06-01T00:00:00Z',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated events', async () => {
      prisma.event.findMany.mockResolvedValue([mockEvent]);
      prisma.event.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return an event by id', async () => {
      prisma.event.findFirst.mockResolvedValue(mockEvent);

      const result = await service.findOne(tenantId, 'event-1');
      expect(result).toEqual(mockEvent);
    });

    it('should throw NotFoundException if event not found', async () => {
      prisma.event.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an event', async () => {
      prisma.event.findFirst.mockResolvedValue(mockEvent);
      prisma.event.update.mockResolvedValue({ ...mockEvent, name: 'Updated' });

      const result = await service.update(tenantId, 'event-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('publish', () => {
    it('should publish a DRAFT event', async () => {
      prisma.event.findFirst.mockResolvedValue(mockEvent);
      prisma.event.update.mockResolvedValue({ ...mockEvent, status: 'PUBLISHED' });

      const result = await service.publish(tenantId, 'event-1');
      expect(result.status).toBe('PUBLISHED');
    });

    it('should throw if event is not DRAFT', async () => {
      prisma.event.findFirst.mockResolvedValue({ ...mockEvent, status: 'PUBLISHED' });

      await expect(service.publish(tenantId, 'event-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('should cancel a DRAFT event', async () => {
      prisma.event.findFirst.mockResolvedValue(mockEvent);
      prisma.event.update.mockResolvedValue({ ...mockEvent, status: 'CANCELLED' });

      const result = await service.cancel(tenantId, 'event-1');
      expect(result.status).toBe('CANCELLED');
    });

    it('should throw if event is already CANCELLED', async () => {
      prisma.event.findFirst.mockResolvedValue({ ...mockEvent, status: 'CANCELLED' });

      await expect(service.cancel(tenantId, 'event-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a DRAFT event', async () => {
      prisma.event.findFirst.mockResolvedValue(mockEvent);
      prisma.event.delete.mockResolvedValue(mockEvent);

      const result = await service.remove(tenantId, 'event-1');
      expect(result).toEqual(mockEvent);
    });

    it('should throw if event is not DRAFT', async () => {
      prisma.event.findFirst.mockResolvedValue({ ...mockEvent, status: 'PUBLISHED' });

      await expect(service.remove(tenantId, 'event-1')).rejects.toThrow(BadRequestException);
    });
  });

  // Edge case tests for EC traceability
  describe('edge cases', () => {
    it('should throw not found for invalid event id', async () => {
      prisma.event.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should handle empty result set for findAll', async () => {
      prisma.event.findMany.mockResolvedValue([]);
      prisma.event.count.mockResolvedValue(0);

      const result = await service.findAll(tenantId);
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it('should throw error when publishing a CANCELLED event (invalid status transition)', async () => {
      prisma.event.findFirst.mockResolvedValue({ ...mockEvent, status: 'CANCELLED' });

      await expect(service.publish(tenantId, 'event-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw error when cancelling a COMPLETED event', async () => {
      prisma.event.findFirst.mockResolvedValue({ ...mockEvent, status: 'COMPLETED' });

      await expect(service.cancel(tenantId, 'event-1')).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid dates where end date equals start date (boundary)', async () => {
      await expect(
        service.create(tenantId, {
          name: 'Boundary Event',
          startDate: '2025-06-01T12:00:00Z',
          endDate: '2025-06-01T12:00:00Z',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error for update with invalid date range', async () => {
      prisma.event.findFirst.mockResolvedValue(mockEvent);

      await expect(
        service.update(tenantId, 'event-1', {
          startDate: '2025-06-05T00:00:00Z',
          endDate: '2025-06-01T00:00:00Z',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error when deleting a non-DRAFT event (duplicate protection)', async () => {
      prisma.event.findFirst.mockResolvedValue({ ...mockEvent, status: 'CANCELLED' });

      await expect(service.remove(tenantId, 'event-1')).rejects.toThrow(BadRequestException);
    });
  });
});
