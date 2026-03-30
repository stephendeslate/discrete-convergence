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
    $executeRaw: jest.Mock;
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
      const mockEvent = {
        id: 'event-1',
        title: 'Test Event',
        organizationId: 'org-1',
      };
      prisma.event.create.mockResolvedValue(mockEvent);

      const result = await service.create(
        {
          title: 'Test Event',
          slug: 'test-event',
          timezone: 'UTC',
          startDate: '2026-06-15T09:00:00Z',
          endDate: '2026-06-15T17:00:00Z',
          capacity: 100,
        },
        'org-1',
      );

      expect(result).toEqual(mockEvent);
      expect(prisma.event.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated events', async () => {
      prisma.event.findMany.mockResolvedValue([
        { id: 'event-1', title: 'Event 1' },
      ]);
      prisma.event.count.mockResolvedValue(1);

      const result = await service.findAll('org-1', { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return an event by id', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-1',
        organizationId: 'org-1',
      });

      const result = await service.findOne('event-1', 'org-1');
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException for wrong organization', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-1',
        organizationId: 'org-2',
      });

      await expect(service.findOne('event-1', 'org-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if event not found', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'org-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an event', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-1',
        organizationId: 'org-1',
        status: 'DRAFT',
      });
      prisma.event.update.mockResolvedValue({
        id: 'event-1',
        title: 'Updated',
      });

      const result = await service.update(
        'event-1',
        { title: 'Updated' },
        'org-1',
      );
      expect(result).toBeDefined();
    });

    it('should reject updates to completed events', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-1',
        organizationId: 'org-1',
        status: 'COMPLETED',
      });

      await expect(
        service.update('event-1', { title: 'Updated' }, 'org-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('publish', () => {
    it('should publish a draft event', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-1',
        organizationId: 'org-1',
        status: 'DRAFT',
      });
      prisma.event.update.mockResolvedValue({
        id: 'event-1',
        status: 'PUBLISHED',
      });

      const result = await service.publish('event-1', 'org-1');
      expect(result).toBeDefined();
    });

    it('should reject publishing non-draft event', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-1',
        organizationId: 'org-1',
        status: 'PUBLISHED',
      });

      await expect(service.publish('event-1', 'org-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('cancel', () => {
    it('should cancel an event', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-1',
        organizationId: 'org-1',
        status: 'PUBLISHED',
      });
      prisma.event.update.mockResolvedValue({
        id: 'event-1',
        status: 'CANCELLED',
      });

      const result = await service.cancel('event-1', 'org-1');
      expect(result).toBeDefined();
    });

    it('should reject cancelling completed event', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-1',
        organizationId: 'org-1',
        status: 'COMPLETED',
      });

      await expect(service.cancel('event-1', 'org-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('checkDatabaseHealth', () => {
    it('should return true when DB is accessible', async () => {
      prisma.$executeRaw.mockResolvedValue(1);

      const result = await service.checkDatabaseHealth();
      expect(result).toBe(true);
    });
  });
});
