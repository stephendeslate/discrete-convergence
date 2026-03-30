import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EventService } from '../src/event/event.service';
import { PrismaService } from '../src/prisma.service';

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
  };

  const tenantId = 'tenant-1';
  const mockEvent = {
    id: 'event-1',
    title: 'Test Event',
    description: 'Test description',
    startDate: new Date('2025-06-15T09:00:00Z'),
    endDate: new Date('2025-06-16T17:00:00Z'),
    status: 'DRAFT',
    tenantId,
    venueId: 'venue-1',
    venue: { id: 'venue-1', name: 'Test Venue' },
  };

  beforeEach(async () => {
    prisma = {
      event: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
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
      const dto = {
        title: 'Test Event',
        startDate: '2025-06-15T09:00:00Z',
        endDate: '2025-06-16T17:00:00Z',
        venueId: 'venue-1',
      };

      const result = await service.create(tenantId, dto);

      expect(result).toEqual(mockEvent);
      expect(prisma.event.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ tenantId, title: dto.title }),
        }),
      );
    });

    it('should throw BadRequestException when end date is before start date', async () => {
      const dto = {
        title: 'Bad Event',
        startDate: '2025-06-16T17:00:00Z',
        endDate: '2025-06-15T09:00:00Z',
        venueId: 'venue-1',
      };

      await expect(service.create(tenantId, dto)).rejects.toThrow(BadRequestException);
      expect(prisma.event.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when end date equals start date', async () => {
      const dto = {
        title: 'Same Date Event',
        startDate: '2025-06-15T09:00:00Z',
        endDate: '2025-06-15T09:00:00Z',
        venueId: 'venue-1',
      };

      await expect(service.create(tenantId, dto)).rejects.toThrow(BadRequestException);
      expect(prisma.event.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated events', async () => {
      prisma.event.findMany.mockResolvedValue([mockEvent]);
      prisma.event.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId);

      expect(result.items).toEqual([mockEvent]);
      expect(result.total).toBe(1);
      expect(prisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId },
        }),
      );
    });

    it('should respect pagination parameters', async () => {
      prisma.event.findMany.mockResolvedValue([]);
      prisma.event.count.mockResolvedValue(0);

      const result = await service.findAll(tenantId, '2', '5');

      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(5);
      expect(prisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
    });
  });

  describe('findOne', () => {
    it('should find an event by id', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      const result = await service.findOne(tenantId, 'event-1');
      expect(result).toEqual(mockEvent);
      expect(prisma.event.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'event-1' } }),
      );
    });

    it('should throw NotFoundException for non-existent event', async () => {
      prisma.event.findUnique.mockResolvedValue(null);
      await expect(service.findOne(tenantId, 'invalid')).rejects.toThrow(NotFoundException);
      expect(prisma.event.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'invalid' } }),
      );
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      prisma.event.findUnique.mockResolvedValue({ ...mockEvent, tenantId: 'other-tenant' });
      await expect(service.findOne(tenantId, 'event-1')).rejects.toThrow(NotFoundException);
      expect(prisma.event.findUnique).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an event', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      prisma.event.update.mockResolvedValue({ ...mockEvent, title: 'Updated' });

      const result = await service.update(tenantId, 'event-1', { title: 'Updated' });

      expect(result.title).toBe('Updated');
      expect(prisma.event.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'event-1' } }),
      );
    });

    it('should throw BadRequestException when updating cancelled event status', async () => {
      prisma.event.findUnique.mockResolvedValue({ ...mockEvent, status: 'CANCELLED' });

      await expect(
        service.update(tenantId, 'event-1', { status: 'PUBLISHED' }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.event.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete an event', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      prisma.event.delete.mockResolvedValue(mockEvent);

      const result = await service.remove(tenantId, 'event-1');

      expect(result).toEqual(mockEvent);
      expect(prisma.event.delete).toHaveBeenCalledWith({ where: { id: 'event-1' } });
    });

    it('should throw NotFoundException when deleting non-existent event', async () => {
      prisma.event.findUnique.mockResolvedValue(null);
      await expect(service.remove(tenantId, 'invalid')).rejects.toThrow(NotFoundException);
      expect(prisma.event.delete).not.toHaveBeenCalled();
    });
  });
});
