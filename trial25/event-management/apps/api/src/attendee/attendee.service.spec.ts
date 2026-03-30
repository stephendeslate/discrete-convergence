// Unit tests
import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AttendeeService } from './attendee.service';
import { PrismaService } from '../infra/prisma.service';

describe('AttendeeService', () => {
  let service: AttendeeService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: Record<string, any>;

  beforeEach(async () => {
    prisma = {
      attendee: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        update: jest.fn(),
      },
      event: { findFirst: jest.fn() },
      auditLog: { create: jest.fn() },
      setTenantContext: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        AttendeeService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AttendeeService>(AttendeeService);
  });

  describe('findAll', () => {
    it('should return paginated results with meta', async () => {
      prisma['attendee'].findMany.mockResolvedValue([{ id: 'a1', name: 'Alice' }]);
      prisma['attendee'].count.mockResolvedValue(1);
      const result = await service.findAll('t1', { page: 1, pageSize: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta).toHaveProperty('page');
    });

    it('should return empty list when no attendees', async () => {
      const result = await service.findAll('t1', {});
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when not found', async () => {
      prisma['attendee'].findFirst.mockResolvedValue(null);
      await expect(service.findOne('bad', 't1')).rejects.toThrow(NotFoundException);
    });

    it('should return attendee when found', async () => {
      const mock = { id: 'a1', name: 'Bob', tenantId: 't1' };
      prisma['attendee'].findFirst.mockResolvedValue(mock);
      const result = await service.findOne('a1', 't1');
      expect(result.id).toBe('a1');
      expect(result.name).toBe('Bob');
    });
  });

  describe('registerAttendee', () => {
    it('should throw NotFoundException for missing event', async () => {
      prisma['event'].findFirst.mockResolvedValue(null);
      await expect(service.registerAttendee({ name: 'A', email: 'a@a.com', eventId: 'bad' }, 't1', 'u1'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw for cancelled event', async () => {
      prisma['event'].findFirst.mockResolvedValue({ id: '1', status: 'CANCELLED', capacity: 100 });
      await expect(service.registerAttendee({ name: 'A', email: 'a@a.com', eventId: '1' }, 't1', 'u1'))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw for completed event', async () => {
      prisma['event'].findFirst.mockResolvedValue({ id: '1', status: 'COMPLETED', capacity: 100 });
      await expect(service.registerAttendee({ name: 'A', email: 'a@a.com', eventId: '1' }, 't1', 'u1'))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw when event at capacity', async () => {
      prisma['event'].findFirst.mockResolvedValue({ id: '1', status: 'PUBLISHED', capacity: 2 });
      prisma['attendee'].count.mockResolvedValue(2);
      await expect(service.registerAttendee({ name: 'A', email: 'a@a.com', eventId: '1' }, 't1', 'u1'))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw for duplicate attendee email in same event', async () => {
      prisma['event'].findFirst.mockResolvedValue({ id: '1', status: 'PUBLISHED', capacity: 100 });
      prisma['attendee'].count.mockResolvedValue(5);
      prisma['attendee'].findFirst.mockResolvedValue({ id: 'existing', email: 'a@a.com' });
      await expect(service.registerAttendee({ name: 'A', email: 'a@a.com', eventId: '1' }, 't1', 'u1'))
        .rejects.toThrow(BadRequestException);
    });

    it('should register attendee successfully with valid data', async () => {
      prisma['event'].findFirst.mockResolvedValue({ id: 'e1', status: 'PUBLISHED', capacity: 100 });
      prisma['attendee'].count.mockResolvedValue(10);
      prisma['attendee'].findFirst.mockResolvedValue(null);
      const created = { id: 'a-new', name: 'Charlie', email: 'c@c.com', tenantId: 't1' };
      prisma['attendee'].create.mockResolvedValue(created);
      prisma['auditLog'].create.mockResolvedValue({});
      const result = await service.registerAttendee({ name: 'Charlie', email: 'c@c.com', eventId: 'e1' }, 't1', 'u1');
      expect(result.id).toBe('a-new');
      expect(result.name).toBe('Charlie');
      expect(prisma['auditLog'].create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ action: 'CREATE', entity: 'Attendee' }) }),
      );
    });
  });

  describe('checkIn', () => {
    it('should throw if already checked in', async () => {
      prisma['attendee'].findFirst.mockResolvedValue({ id: '1', checkedIn: true, tenantId: 't1', eventId: 'e1' });
      await expect(service.checkIn('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('should throw if event is cancelled', async () => {
      prisma['attendee'].findFirst.mockResolvedValue({ id: '1', checkedIn: false, tenantId: 't1', eventId: 'e1' });
      prisma['event'].findFirst.mockResolvedValue({ id: 'e1', status: 'CANCELLED' });
      await expect(service.checkIn('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('should check in attendee successfully', async () => {
      prisma['attendee'].findFirst.mockResolvedValue({ id: '1', checkedIn: false, tenantId: 't1', eventId: 'e1' });
      prisma['event'].findFirst.mockResolvedValue({ id: 'e1', status: 'PUBLISHED' });
      const checkedIn = { id: '1', checkedIn: true, checkedInAt: new Date(), tenantId: 't1' };
      prisma['attendee'].update.mockResolvedValue(checkedIn);
      prisma['auditLog'].create.mockResolvedValue({});
      const result = await service.checkIn('1', 't1', 'u1');
      expect(result.checkedIn).toBe(true);
      expect(result.checkedInAt).toBeDefined();
      expect(prisma['attendee'].update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ checkedIn: true }) }),
      );
      expect(prisma['auditLog'].create).toHaveBeenCalled();
    });
  });
});
