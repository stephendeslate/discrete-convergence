import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TicketTypeService } from './ticket-type.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventService } from '../event/event.service';

describe('TicketTypeService', () => {
  let service: TicketTypeService;
  let prisma: {
    ticketType: { create: jest.Mock; findMany: jest.Mock; findFirst: jest.Mock };
  };
  let eventService: { findOne: jest.Mock };

  const tenantId = 'tenant-1';
  const eventId = 'event-1';

  beforeEach(async () => {
    prisma = {
      ticketType: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
    };
    eventService = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketTypeService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventService, useValue: eventService },
      ],
    }).compile();

    service = module.get<TicketTypeService>(TicketTypeService);
  });

  describe('create', () => {
    it('should create a ticket type', async () => {
      eventService.findOne.mockResolvedValue({ id: eventId });
      const dto = { name: 'VIP', price: 100, quantity: 50 };
      prisma.ticketType.create.mockResolvedValue({ id: 'tt-1', ...dto, eventId });

      const result = await service.create(tenantId, eventId, dto);

      expect(result.id).toBe('tt-1');
    });

    it('should throw error for invalid negative price', async () => {
      eventService.findOne.mockResolvedValue({ id: eventId });

      await expect(
        service.create(tenantId, eventId, { name: 'Bad', price: -10, quantity: 10 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw not found when event does not exist', async () => {
      eventService.findOne.mockRejectedValue(new NotFoundException('Event not found'));

      await expect(
        service.create(tenantId, 'nonexistent', { name: 'VIP', price: 100, quantity: 50 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEvent', () => {
    it('should return ticket types for an event', async () => {
      eventService.findOne.mockResolvedValue({ id: eventId });
      prisma.ticketType.findMany.mockResolvedValue([{ id: 'tt-1' }]);

      const result = await service.findByEvent(tenantId, eventId);

      expect(result).toHaveLength(1);
    });

    it('should return empty array when no ticket types exist', async () => {
      eventService.findOne.mockResolvedValue({ id: eventId });
      prisma.ticketType.findMany.mockResolvedValue([]);

      const result = await service.findByEvent(tenantId, eventId);

      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a ticket type by id', async () => {
      prisma.ticketType.findFirst.mockResolvedValue({ id: 'tt-1', name: 'VIP' });

      const result = await service.findOne('tt-1');

      expect(result.id).toBe('tt-1');
    });

    it('should throw not found for nonexistent ticket type', async () => {
      prisma.ticketType.findFirst.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
