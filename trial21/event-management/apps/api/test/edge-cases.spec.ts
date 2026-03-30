import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EventService } from '../src/event/event.service';
import { RegistrationService } from '../src/registration/registration.service';
import { CheckInService } from '../src/check-in/check-in.service';
import { SessionService } from '../src/session/session.service';
import { PrismaService } from '../src/infra/prisma.service';
import { TEST_EVENT_PAST, TEST_EVENT_OPEN, TEST_TICKET_TYPE } from './helpers/fixtures';

/** TRACED:EM-EDGE-001 — Edge case tests for domain-specific scenarios */

const mockPrisma = {
  event: { findFirst: jest.fn(), findUnique: jest.fn(), update: jest.fn(), create: jest.fn(), findMany: jest.fn(), count: jest.fn(), delete: jest.fn() },
  ticketType: { findFirst: jest.fn() },
  registration: { count: jest.fn(), create: jest.fn(), findFirst: jest.fn(), findUnique: jest.fn(), update: jest.fn(), findMany: jest.fn() },
  eventSession: { create: jest.fn(), findFirst: jest.fn(), findMany: jest.fn(), update: jest.fn(), delete: jest.fn() },
  checkIn: { findFirst: jest.fn(), create: jest.fn() },
  waitlistEntry: { findFirst: jest.fn(), delete: jest.fn() },
  user: { findFirst: jest.fn() },
};

describe('Edge Cases', () => {
  let eventService: EventService;
  let registrationService: RegistrationService;
  let checkInService: CheckInService;
  let sessionService: SessionService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        EventService,
        RegistrationService,
        CheckInService,
        SessionService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    eventService = module.get(EventService);
    registrationService = module.get(RegistrationService);
    checkInService = module.get(CheckInService);
    sessionService = module.get(SessionService);
  });

  // TRACED:EM-EDGE-002 — past events cannot be modified
  describe('Past events', () => {
    it('should not allow cancelling a completed (past) event', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(TEST_EVENT_PAST);
      await expect(eventService.cancel(TEST_EVENT_PAST.id, TEST_EVENT_PAST.organizationId))
        .rejects.toThrow(BadRequestException);
    });

    it('should not allow transitioning completed event to draft', async () => {
      mockPrisma.event.findFirst.mockResolvedValue(TEST_EVENT_PAST);
      await expect(eventService.update(TEST_EVENT_PAST.id, { status: 'DRAFT' }, TEST_EVENT_PAST.organizationId))
        .rejects.toThrow(BadRequestException);
    });
  });

  // TRACED:EM-EDGE-003 — sold-out venues reject registration
  describe('Sold-out venues', () => {
    it('should reject registration when ticket quota is reached', async () => {
      mockPrisma.ticketType.findFirst.mockResolvedValue({ ...TEST_TICKET_TYPE, quota: 1 });
      mockPrisma.event.findUnique.mockResolvedValue(TEST_EVENT_OPEN);
      mockPrisma.registration.count.mockResolvedValue(1);

      await expect(
        registrationService.register(TEST_EVENT_OPEN.id, 'u1', { ticketTypeId: TEST_TICKET_TYPE.id }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // TRACED:EM-EDGE-004 — invalid status transitions rejected
  describe('Status transitions', () => {
    it('should not allow ARCHIVED to any other status', async () => {
      mockPrisma.event.findFirst.mockResolvedValue({ ...TEST_EVENT_PAST, status: 'ARCHIVED' });
      await expect(
        eventService.update(TEST_EVENT_PAST.id, { status: 'PUBLISHED' }, TEST_EVENT_PAST.organizationId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should not allow CANCELLED to any other status', async () => {
      mockPrisma.event.findFirst.mockResolvedValue({ ...TEST_EVENT_PAST, status: 'CANCELLED' });
      await expect(
        eventService.update(TEST_EVENT_PAST.id, { status: 'DRAFT' }, TEST_EVENT_PAST.organizationId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // TRACED:EM-EDGE-005 — timezone handling stores UTC
  describe('Timezone handling', () => {
    it('should store dates in UTC for events with different timezone', async () => {
      mockPrisma.event.create.mockImplementation(({ data }: { data: Record<string, unknown> }) => {
        expect(data.startDate).toBeInstanceOf(Date);
        expect(data.endDate).toBeInstanceOf(Date);
        return Promise.resolve({ id: 'e1', ...data });
      });
      await eventService.create({
        title: 'TZ Event', slug: 'tz-event', timezone: 'Asia/Tokyo',
        startDate: '2025-07-01T09:00:00Z', endDate: '2025-07-01T17:00:00Z',
      }, 'org1');
      expect(mockPrisma.event.create).toHaveBeenCalledTimes(1);
    });
  });

  // TRACED:EM-EDGE-006 — idempotent check-in
  describe('Idempotent check-in', () => {
    it('should not create duplicate check-in records', async () => {
      const now = new Date();
      mockPrisma.registration.findUnique.mockResolvedValue({ id: 'r1', status: 'CHECKED_IN' });
      mockPrisma.checkIn.findFirst.mockResolvedValue({ checkedInAt: now });

      const result = await checkInService.checkIn('r1');
      expect(result.status).toBe('already_checked_in');
      expect(mockPrisma.checkIn.create).not.toHaveBeenCalled();
    });
  });

  // TRACED:EM-EDGE-007 — session must be within event window
  describe('Session within event window', () => {
    it('should reject session that extends past event end', async () => {
      mockPrisma.event.findFirst.mockResolvedValue({
        id: 'e1',
        startDate: new Date('2025-06-01T09:00:00Z'),
        endDate: new Date('2025-06-01T17:00:00Z'),
      });
      await expect(
        sessionService.create('e1', {
          title: 'Late Session',
          startTime: '2025-06-01T16:00:00Z',
          endTime: '2025-06-01T18:00:00Z',
        }, 'org1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // TRACED:EM-EDGE-008 — registration rejected on non-open event
  describe('Registration on non-open event', () => {
    it('should reject registration on DRAFT event', async () => {
      mockPrisma.ticketType.findFirst.mockResolvedValue(TEST_TICKET_TYPE);
      mockPrisma.event.findUnique.mockResolvedValue({ ...TEST_EVENT_OPEN, status: 'DRAFT' });
      await expect(
        registrationService.register('e1', 'u1', { ticketTypeId: TEST_TICKET_TYPE.id }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // TRACED:EM-EDGE-009 — cancel after check-in rejected
  describe('Cancel after check-in', () => {
    it('should reject cancellation after check-in', async () => {
      mockPrisma.registration.findFirst.mockResolvedValue({ id: 'r1', status: 'CHECKED_IN' });
      await expect(
        registrationService.cancel('r1', 'u1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // TRACED:EM-EDGE-010 — event date validation
  describe('Event date validation', () => {
    it('should reject event where end equals start', async () => {
      const sameDate = '2025-06-01T10:00:00Z';
      await expect(
        eventService.create({
          title: 'Zero Duration', slug: 'zero', timezone: 'UTC',
          startDate: sameDate, endDate: sameDate,
        }, 'org1'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
