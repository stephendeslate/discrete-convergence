// TRACED: EM-API-006 — Registration service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventService } from '../event/event.service';
import { TicketTypeService } from '../ticket-type/ticket-type.service';

describe('RegistrationService', () => {
  let service: RegistrationService;
  let prisma: {
    registration: { create: jest.Mock; findMany: jest.Mock; findFirst: jest.Mock; count: jest.Mock };
    ticketType: { update: jest.Mock };
    $transaction: jest.Mock;
  };
  let eventService: { findOne: jest.Mock };
  let ticketTypeService: { findOne: jest.Mock };

  const tenantId = 'tenant-1';
  const eventId = 'event-1';

  beforeEach(async () => {
    prisma = {
      registration: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
      },
      ticketType: { update: jest.fn() },
      $transaction: jest.fn(),
    };

    eventService = { findOne: jest.fn() };
    ticketTypeService = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventService, useValue: eventService },
        { provide: TicketTypeService, useValue: ticketTypeService },
      ],
    }).compile();

    service = module.get<RegistrationService>(RegistrationService);
  });

  describe('create', () => {
    const dto = {
      ticketTypeId: 'tt-1',
      attendeeName: 'John Doe',
      attendeeEmail: 'john@example.com',
    };

    it('should create a registration', async () => {
      eventService.findOne.mockResolvedValue({ id: eventId, status: 'PUBLISHED' });
      ticketTypeService.findOne.mockResolvedValue({ id: 'tt-1', eventId, sold: 0, quantity: 100 });
      prisma.registration.findFirst.mockResolvedValue(null);
      const mockReg = { id: 'reg-1', ...dto, eventId, status: 'CONFIRMED' };
      prisma.$transaction.mockResolvedValue([mockReg, {}]);

      const result = await service.create(tenantId, eventId, dto);
      expect(result.id).toBe('reg-1');
    });

    it('should throw if event is not PUBLISHED', async () => {
      eventService.findOne.mockResolvedValue({ id: eventId, status: 'DRAFT' });

      await expect(service.create(tenantId, eventId, dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw if ticket type is sold out', async () => {
      eventService.findOne.mockResolvedValue({ id: eventId, status: 'PUBLISHED' });
      ticketTypeService.findOne.mockResolvedValue({ id: 'tt-1', eventId, sold: 100, quantity: 100 });

      await expect(service.create(tenantId, eventId, dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw if ticket type does not belong to event', async () => {
      eventService.findOne.mockResolvedValue({ id: eventId, status: 'PUBLISHED' });
      ticketTypeService.findOne.mockResolvedValue({ id: 'tt-1', eventId: 'other-event', sold: 0, quantity: 100 });

      await expect(service.create(tenantId, eventId, dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw for duplicate registration', async () => {
      eventService.findOne.mockResolvedValue({ id: eventId, status: 'PUBLISHED' });
      ticketTypeService.findOne.mockResolvedValue({ id: 'tt-1', eventId, sold: 0, quantity: 100 });
      prisma.registration.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(service.create(tenantId, eventId, dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByEvent', () => {
    it('should return paginated registrations', async () => {
      eventService.findOne.mockResolvedValue({ id: eventId });
      prisma.registration.findMany.mockResolvedValue([]);
      prisma.registration.count.mockResolvedValue(0);

      const result = await service.findByEvent(tenantId, eventId);
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it('should return empty result set for event with no registrations', async () => {
      eventService.findOne.mockResolvedValue({ id: eventId });
      prisma.registration.findMany.mockResolvedValue([]);
      prisma.registration.count.mockResolvedValue(0);

      const result = await service.findByEvent(tenantId, eventId, '1', '10');
      expect(result.data).toEqual([]);
    });
  });

  describe('edge cases', () => {
    const dto = {
      ticketTypeId: 'tt-1',
      attendeeName: 'John Doe',
      attendeeEmail: 'john@example.com',
    };

    it('should throw error for duplicate registration with same email', async () => {
      eventService.findOne.mockResolvedValue({ id: eventId, status: 'PUBLISHED' });
      ticketTypeService.findOne.mockResolvedValue({ id: 'tt-1', eventId, sold: 0, quantity: 100 });
      prisma.registration.findFirst.mockResolvedValue({ id: 'existing-reg' });

      await expect(service.create(tenantId, eventId, dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw error when ticket type is sold out (boundary: sold equals quantity)', async () => {
      eventService.findOne.mockResolvedValue({ id: eventId, status: 'PUBLISHED' });
      ticketTypeService.findOne.mockResolvedValue({ id: 'tt-1', eventId, sold: 50, quantity: 50 });

      await expect(service.create(tenantId, eventId, dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw error for registration on non-PUBLISHED event (invalid status)', async () => {
      eventService.findOne.mockResolvedValue({ id: eventId, status: 'CANCELLED' });

      await expect(service.create(tenantId, eventId, dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw error when ticket type does not belong to event (conflict)', async () => {
      eventService.findOne.mockResolvedValue({ id: eventId, status: 'PUBLISHED' });
      ticketTypeService.findOne.mockResolvedValue({ id: 'tt-1', eventId: 'other-event', sold: 0, quantity: 100 });

      await expect(service.create(tenantId, eventId, dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw not found when event does not exist for findByEvent', async () => {
      eventService.findOne.mockRejectedValue(new (jest.requireActual('@nestjs/common').NotFoundException)('Event not found'));

      await expect(service.findByEvent(tenantId, 'nonexistent')).rejects.toThrow();
    });
  });
});
