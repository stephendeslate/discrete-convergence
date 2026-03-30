import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventService } from './event.service';
import { PrismaService } from '../infra/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

jest.mock('@event-management/shared', () => ({
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
}));

jest.mock('../common/pagination.utils', () => ({
  getPaginationParams: jest
    .fn()
    .mockReturnValue({ skip: 0, take: 10, page: 1, pageSize: 10 }),
}));

const mockPrisma = {
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

describe('EventService', () => {
  let service: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    jest.clearAllMocks();
  });

  const tenantId = 'tenant-1';

  describe('create', () => {
    it('should create an event with tenantId and venue include', async () => {
      const dto = {
        title: 'Test Event',
        description: 'A test event',
        date: '2026-06-01T00:00:00Z',
        venueId: 'venue-1',
      };
      const expected = { id: 'event-1', ...dto, tenantId };
      mockPrisma.event.create.mockResolvedValue(expected);

      const result = await service.create(tenantId, dto as CreateEventDto);

      expect(result).toEqual(expected);
      expect(mockPrisma.event.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: dto.title,
          tenantId,
          venueId: dto.venueId,
        }),
        include: { venue: true },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated events with count', async () => {
      const events = [{ id: 'event-1' }];
      mockPrisma.event.findMany.mockResolvedValue(events);
      mockPrisma.event.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId);

      expect(result).toEqual({
        data: events,
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });
      expect(mockPrisma.event.findMany).toHaveBeenCalledWith({
        where: { tenantId },
        include: { venue: true },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return event when found', async () => {
      const event = { id: 'event-1', tenantId };
      mockPrisma.event.findFirst.mockResolvedValue(event);

      const result = await service.findOne(tenantId, 'event-1');

      expect(result).toEqual(event);
      expect(mockPrisma.event.findFirst).toHaveBeenCalledWith({
        where: { id: 'event-1', tenantId },
        include: { venue: true, registrations: true },
      });
    });

    it('should throw NotFoundException when event not found', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.event.findFirst).toHaveBeenCalledWith({
        where: { id: 'missing', tenantId },
        include: { venue: true, registrations: true },
      });
    });
  });

  describe('update', () => {
    it('should find then update the event', async () => {
      const event = { id: 'event-1', tenantId };
      mockPrisma.event.findFirst.mockResolvedValue(event);
      mockPrisma.event.update.mockResolvedValue({ ...event, title: 'Updated' });

      const dto = { title: 'Updated' };
      const result = await service.update(tenantId, 'event-1', dto as UpdateEventDto);

      expect(result.title).toBe('Updated');
      expect(mockPrisma.event.update).toHaveBeenCalledWith({
        where: { id: 'event-1' },
        data: expect.objectContaining({ title: 'Updated' }),
        include: { venue: true },
      });
    });
  });

  describe('remove', () => {
    it('should find then delete the event', async () => {
      const event = { id: 'event-1', tenantId };
      mockPrisma.event.findFirst.mockResolvedValue(event);
      mockPrisma.event.delete.mockResolvedValue(event);

      await service.remove(tenantId, 'event-1');

      expect(mockPrisma.event.delete).toHaveBeenCalledWith({
        where: { id: 'event-1' },
      });
    });
  });
});
