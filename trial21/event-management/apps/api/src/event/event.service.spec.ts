import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EventService } from './event.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  event: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('EventService', () => {
  let service: EventService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(EventService);
  });

  describe('create', () => {
    it('should create an event with valid dates', async () => {
      const created = { id: 'e1', title: 'Test Event', status: 'DRAFT' };
      mockPrisma.event.create.mockResolvedValue(created);

      const result = await service.create({
        title: 'Test Event', slug: 'test-event', timezone: 'UTC',
        startDate: '2025-06-01T10:00:00Z', endDate: '2025-06-01T18:00:00Z',
      }, 'org1');
      expect(result.title).toBe('Test Event');
      expect(mockPrisma.event.create).toHaveBeenCalledTimes(1);
    });

    it('should reject if end date is before start date', async () => {
      await expect(
        service.create({
          title: 'Bad', slug: 'bad', timezone: 'UTC',
          startDate: '2025-06-01T18:00:00Z', endDate: '2025-06-01T10:00:00Z',
        }, 'org1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return event when found', async () => {
      mockPrisma.event.findFirst.mockResolvedValue({ id: 'e1', title: 'Found' });
      const result = await service.findOne('e1', 'org1');
      expect(result.title).toBe('Found');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(null);
      await expect(service.findOne('missing', 'org1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update event fields', async () => {
      mockPrisma.event.findFirst.mockResolvedValue({ id: 'e1', status: 'DRAFT' });
      mockPrisma.event.update.mockResolvedValue({ id: 'e1', title: 'Updated' });
      const result = await service.update('e1', { title: 'Updated' }, 'org1');
      expect(result.title).toBe('Updated');
    });

    it('should reject invalid status transition', async () => {
      mockPrisma.event.findFirst.mockResolvedValue({ id: 'e1', status: 'COMPLETED' });
      await expect(
        service.update('e1', { status: 'DRAFT' }, 'org1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow valid status transition DRAFT to PUBLISHED', async () => {
      mockPrisma.event.findFirst.mockResolvedValue({ id: 'e1', status: 'DRAFT' });
      mockPrisma.event.update.mockResolvedValue({ id: 'e1', status: 'PUBLISHED' });
      const result = await service.update('e1', { status: 'PUBLISHED' }, 'org1');
      expect(result.status).toBe('PUBLISHED');
    });
  });

  describe('cancel', () => {
    it('should cancel a non-completed event', async () => {
      mockPrisma.event.findFirst.mockResolvedValue({ id: 'e1', status: 'PUBLISHED' });
      mockPrisma.event.update.mockResolvedValue({ id: 'e1', status: 'CANCELLED' });
      const result = await service.cancel('e1', 'org1');
      expect(result.status).toBe('CANCELLED');
    });

    it('should reject cancelling a completed event', async () => {
      mockPrisma.event.findFirst.mockResolvedValue({ id: 'e1', status: 'COMPLETED' });
      await expect(service.cancel('e1', 'org1')).rejects.toThrow(BadRequestException);
    });

    it('should reject cancelling an already cancelled event', async () => {
      mockPrisma.event.findFirst.mockResolvedValue({ id: 'e1', status: 'CANCELLED' });
      await expect(service.cancel('e1', 'org1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findBySlug', () => {
    it('should find public event by slug', async () => {
      mockPrisma.event.findFirst.mockResolvedValue({ id: 'e1', slug: 'my-event' });
      const result = await service.findBySlug('my-event');
      expect(result.slug).toBe('my-event');
    });

    it('should throw if slug not found', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(null);
      await expect(service.findBySlug('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated events with total', async () => {
      mockPrisma.event.findMany.mockResolvedValue([{ id: 'e1' }]);
      mockPrisma.event.count.mockResolvedValue(1);
      const result = await service.findAll('org1', 1, 20);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });
});
