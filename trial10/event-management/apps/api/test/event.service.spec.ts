import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EventService } from '../src/event/event.service';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaService } from './helpers/mock-prisma';

describe('EventService', () => {
  let service: EventService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  const tenantId = 'tenant-1';
  const mockEvent = {
    id: 'event-1',
    title: 'Test Event',
    description: 'A test event',
    startDate: new Date('2025-06-01T09:00:00Z'),
    endDate: new Date('2025-06-01T17:00:00Z'),
    status: 'DRAFT',
    tenantId,
    venueId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = createMockPrismaService();
    prisma.$executeRaw.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
  });

  describe('create', () => {
    it('should create an event with DRAFT status', async () => {
      const dto = {
        title: 'New Event',
        description: 'Description',
        startDate: '2025-06-01T09:00:00Z',
        endDate: '2025-06-01T17:00:00Z',
      };

      prisma.event.create.mockResolvedValue({ ...mockEvent, ...dto });

      const result = await service.create(tenantId, dto);
      expect(result.title).toBe(dto.title);
      expect(prisma.event.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: dto.title,
          status: 'DRAFT',
          tenantId,
        }),
      });
    });

    it('should set RLS tenant context before creating', async () => {
      const dto = {
        title: 'New Event',
        startDate: '2025-06-01T09:00:00Z',
        endDate: '2025-06-01T17:00:00Z',
      };

      prisma.event.create.mockResolvedValue(mockEvent);
      await service.create(tenantId, dto);

      expect(prisma.$executeRaw).toHaveBeenCalled();
      expect(prisma.event.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated events for tenant', async () => {
      prisma.event.findMany.mockResolvedValue([mockEvent]);
      prisma.event.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId, 1, 20);
      expect(result.items).toHaveLength(1);
      expect(prisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return event by id and tenant', async () => {
      prisma.event.findFirst.mockResolvedValue(mockEvent);

      const result = await service.findOne(tenantId, 'event-1');
      expect(result.id).toBe('event-1');
      expect(prisma.event.findFirst).toHaveBeenCalledWith({
        where: { id: 'event-1', tenantId },
        include: { venue: true, tickets: true, registrations: true },
      });
    });

    it('should throw NotFoundException if event not found', async () => {
      prisma.event.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'nonexistent'))
        .rejects.toThrow(NotFoundException);
      expect(prisma.event.findFirst).toHaveBeenCalledWith({
        where: { id: 'nonexistent', tenantId },
        include: { venue: true, tickets: true, registrations: true },
      });
    });
  });

  describe('update', () => {
    it('should update event fields', async () => {
      prisma.event.findFirst.mockResolvedValue(mockEvent);
      prisma.event.update.mockResolvedValue({ ...mockEvent, title: 'Updated' });

      const result = await service.update(tenantId, 'event-1', { title: 'Updated' });
      expect(result.title).toBe('Updated');
      expect(prisma.event.update).toHaveBeenCalledWith({
        where: { id: 'event-1' },
        data: expect.objectContaining({ title: 'Updated' }),
      });
    });

    it('should allow valid status transition DRAFT to PUBLISHED', async () => {
      prisma.event.findFirst.mockResolvedValue(mockEvent);
      prisma.event.update.mockResolvedValue({ ...mockEvent, status: 'PUBLISHED' });

      const result = await service.update(tenantId, 'event-1', { status: 'PUBLISHED' });
      expect(result.status).toBe('PUBLISHED');
      expect(prisma.event.update).toHaveBeenCalledWith({
        where: { id: 'event-1' },
        data: expect.objectContaining({ status: 'PUBLISHED' }),
      });
    });

    it('should reject invalid status transition CANCELLED to PUBLISHED', async () => {
      prisma.event.findFirst.mockResolvedValue({ ...mockEvent, status: 'CANCELLED' });

      await expect(service.update(tenantId, 'event-1', { status: 'PUBLISHED' }))
        .rejects.toThrow(BadRequestException);
      expect(prisma.event.findFirst).toHaveBeenCalledWith({
        where: { id: 'event-1', tenantId },
        include: { venue: true, tickets: true, registrations: true },
      });
    });

    it('should reject transition from PUBLISHED to DRAFT', async () => {
      prisma.event.findFirst.mockResolvedValue({ ...mockEvent, status: 'PUBLISHED' });

      await expect(service.update(tenantId, 'event-1', { status: 'DRAFT' }))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should set event status to CANCELLED', async () => {
      prisma.event.findFirst.mockResolvedValue(mockEvent);
      prisma.event.update.mockResolvedValue({ ...mockEvent, status: 'CANCELLED' });

      const result = await service.remove(tenantId, 'event-1');
      expect(result.status).toBe('CANCELLED');
      expect(prisma.event.update).toHaveBeenCalledWith({
        where: { id: 'event-1' },
        data: { status: 'CANCELLED' },
      });
    });
  });
});
