// Unit tests
import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { PrismaService } from '../infra/prisma.service';

describe('TicketService', () => {
  let service: TicketService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: Record<string, any>;

  beforeEach(async () => {
    prisma = {
      ticket: {
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
        TicketService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TicketService>(TicketService);
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      prisma['ticket'].findMany.mockResolvedValue([{ id: 't1', type: 'GENERAL' }]);
      prisma['ticket'].count.mockResolvedValue(1);
      const result = await service.findAll('t1', { page: 1, pageSize: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta).toHaveProperty('page');
    });

    it('should return empty list when no tickets', async () => {
      const result = await service.findAll('t1', {});
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when not found', async () => {
      prisma['ticket'].findFirst.mockResolvedValue(null);
      await expect(service.findOne('bad', 't1')).rejects.toThrow(NotFoundException);
    });

    it('should return ticket when found', async () => {
      const mock = { id: 'tk1', type: 'VIP', tenantId: 't1' };
      prisma['ticket'].findFirst.mockResolvedValue(mock);
      const result = await service.findOne('tk1', 't1');
      expect(result.id).toBe('tk1');
      expect(result.type).toBe('VIP');
    });
  });

  describe('create', () => {
    it('should throw NotFoundException for missing event', async () => {
      prisma['event'].findFirst.mockResolvedValue(null);
      await expect(service.create({ eventId: 'bad', price: 100 }, 't1', 'u1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for cancelled event', async () => {
      prisma['event'].findFirst.mockResolvedValue({ id: '1', status: 'CANCELLED', capacity: 100 });
      await expect(service.create({ eventId: '1', price: 100 }, 't1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when event at capacity', async () => {
      prisma['event'].findFirst.mockResolvedValue({ id: '1', status: 'PUBLISHED', capacity: 2 });
      prisma['ticket'].count.mockResolvedValue(2);
      await expect(service.create({ eventId: '1', price: 50 }, 't1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('should create ticket successfully when event has capacity', async () => {
      prisma['event'].findFirst.mockResolvedValue({ id: 'e1', status: 'PUBLISHED', capacity: 100 });
      prisma['ticket'].count.mockResolvedValue(5);
      const created = { id: 'tk-new', type: 'GENERAL', price: 50, tenantId: 't1' };
      prisma['ticket'].create.mockResolvedValue(created);
      prisma['auditLog'].create.mockResolvedValue({});
      const result = await service.create({ eventId: 'e1', price: 50 }, 't1', 'u1');
      expect(result.id).toBe('tk-new');
      expect(result.type).toBe('GENERAL');
      expect(prisma['auditLog'].create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ action: 'CREATE', entity: 'Ticket' }) }),
      );
    });

    it('should create ticket with explicit type', async () => {
      prisma['event'].findFirst.mockResolvedValue({ id: 'e1', status: 'PUBLISHED', capacity: 100 });
      prisma['ticket'].count.mockResolvedValue(0);
      const created = { id: 'tk-vip', type: 'VIP', price: 200, tenantId: 't1' };
      prisma['ticket'].create.mockResolvedValue(created);
      prisma['auditLog'].create.mockResolvedValue({});
      const result = await service.create({ eventId: 'e1', price: 200, type: 'VIP' }, 't1', 'u1');
      expect(result.type).toBe('VIP');
      expect(result.price).toBe(200);
    });
  });

  describe('cancelTicket', () => {
    it('should throw for already cancelled ticket', async () => {
      prisma['ticket'].findFirst.mockResolvedValue({ id: '1', status: 'CANCELLED', tenantId: 't1' });
      await expect(service.cancelTicket('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('should throw for refunded ticket', async () => {
      prisma['ticket'].findFirst.mockResolvedValue({ id: '1', status: 'REFUNDED', tenantId: 't1' });
      await expect(service.cancelTicket('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('should cancel an available ticket successfully', async () => {
      prisma['ticket'].findFirst.mockResolvedValue({ id: '1', status: 'AVAILABLE', tenantId: 't1' });
      const cancelled = { id: '1', status: 'CANCELLED', tenantId: 't1' };
      prisma['ticket'].update.mockResolvedValue(cancelled);
      prisma['auditLog'].create.mockResolvedValue({});
      const result = await service.cancelTicket('1', 't1', 'u1');
      expect(result.status).toBe('CANCELLED');
      expect(prisma['ticket'].update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'CANCELLED' } }),
      );
      expect(prisma['auditLog'].create).toHaveBeenCalled();
    });

    it('should cancel a sold ticket successfully', async () => {
      prisma['ticket'].findFirst.mockResolvedValue({ id: '1', status: 'SOLD', tenantId: 't1' });
      const cancelled = { id: '1', status: 'CANCELLED', tenantId: 't1' };
      prisma['ticket'].update.mockResolvedValue(cancelled);
      prisma['auditLog'].create.mockResolvedValue({});
      const result = await service.cancelTicket('1', 't1', 'u1');
      expect(result.status).toBe('CANCELLED');
    });
  });

  describe('refundTicket', () => {
    it('should throw for non-sold ticket', async () => {
      prisma['ticket'].findFirst.mockResolvedValue({ id: '1', status: 'AVAILABLE', tenantId: 't1', price: 100 });
      await expect(service.refundTicket('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('should throw for free ticket', async () => {
      prisma['ticket'].findFirst.mockResolvedValue({ id: '1', status: 'SOLD', tenantId: 't1', price: 0 });
      await expect(service.refundTicket('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('should throw for cancelled ticket', async () => {
      prisma['ticket'].findFirst.mockResolvedValue({ id: '1', status: 'CANCELLED', tenantId: 't1', price: 100 });
      await expect(service.refundTicket('1', 't1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('should refund sold ticket with positive price', async () => {
      prisma['ticket'].findFirst.mockResolvedValue({ id: '1', status: 'SOLD', tenantId: 't1', price: 99 });
      const refunded = { id: '1', status: 'REFUNDED', tenantId: 't1' };
      prisma['ticket'].update.mockResolvedValue(refunded);
      prisma['auditLog'].create.mockResolvedValue({});
      const result = await service.refundTicket('1', 't1', 'u1');
      expect(result.status).toBe('REFUNDED');
      expect(prisma['ticket'].update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'REFUNDED' } }),
      );
      expect(prisma['auditLog'].create).toHaveBeenCalled();
    });
  });
});
