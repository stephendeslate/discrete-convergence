import { NotFoundException } from '@nestjs/common';
import { AttendeeService } from '../src/attendee/attendee.service';
import { PrismaService } from '../src/common/prisma.service';
import { mockPrismaService, resetMocks } from './helpers/setup';
import { Test } from '@nestjs/testing';

describe('AttendeeService', () => {
  let service: AttendeeService;

  beforeEach(async () => {
    resetMocks();
    const module = await Test.createTestingModule({
      providers: [
        AttendeeService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();
    service = module.get(AttendeeService);
  });

  describe('create', () => {
    it('should create attendee with REGISTERED status by default', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue({ id: 'evt-1' });
      mockPrismaService.ticket.findUnique.mockResolvedValue({ id: 'tkt-1', eventId: 'evt-1' });
      mockPrismaService.attendee.create.mockResolvedValue({
        id: 'att-1',
        name: 'Alice',
        email: 'alice@test.com',
        checkInStatus: 'REGISTERED',
        eventId: 'evt-1',
        ticketId: 'tkt-1',
      });

      const result = await service.create({
        name: 'Alice',
        email: 'alice@test.com',
        eventId: 'evt-1',
        ticketId: 'tkt-1',
      });

      expect(result.checkInStatus).toBe('REGISTERED');
      expect(result.name).toBe('Alice');
    });

    it('should reject if event not found', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue(null);
      await expect(
        service.create({
          name: 'Alice',
          email: 'alice@test.com',
          eventId: 'nonexistent',
          ticketId: 'tkt-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject if ticket does not belong to event', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue({ id: 'evt-1' });
      mockPrismaService.ticket.findUnique.mockResolvedValue({ id: 'tkt-1', eventId: 'evt-2' });

      await expect(
        service.create({
          name: 'Alice',
          email: 'alice@test.com',
          eventId: 'evt-1',
          ticketId: 'tkt-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      mockPrismaService.attendee.findMany.mockResolvedValue([
        { id: 'att-1', name: 'Alice', checkInStatus: 'CHECKED_IN' },
        { id: 'att-2', name: 'Bob', checkInStatus: 'REGISTERED' },
      ]);
      mockPrismaService.attendee.count.mockResolvedValue(50);

      const result = await service.findAll('evt-1', { page: 1, pageSize: 20 });
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(50);
      expect(result.meta.totalPages).toBe(3); // ceil(50/20)
    });
  });

  describe('update', () => {
    it('should update check-in status', async () => {
      mockPrismaService.attendee.findUnique.mockResolvedValue({
        id: 'att-1',
        checkInStatus: 'REGISTERED',
      });
      mockPrismaService.attendee.update.mockResolvedValue({
        id: 'att-1',
        checkInStatus: 'CHECKED_IN',
      });

      const result = await service.update('att-1', { checkInStatus: 'CHECKED_IN' });
      expect(result.checkInStatus).toBe('CHECKED_IN');
    });
  });
});
