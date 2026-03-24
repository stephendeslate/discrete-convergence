// TRACED:EM-API-014 — Integration tests for TicketService with Decimal handling
import type { TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TicketService } from '../src/ticket/ticket.service';
import { mockPrismaService, resetMocks, createTestModule, TEST_TENANT_ID } from './helpers/setup';

describe('TicketService', () => {
  let service: TicketService;

  beforeEach(async () => {
    resetMocks();
    const module: TestingModule = await createTestModule([TicketService]);
    service = module.get<TicketService>(TicketService);
  });

  describe('create', () => {
    it('should create a ticket with Decimal price', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue({
        id: 'event-001',
        tenantId: TEST_TENANT_ID,
      });
      const created = {
        id: 'ticket-001',
        type: 'GENERAL',
        price: '99.99',
        quantity: 100,
        sold: 0,
        eventId: 'event-001',
      };
      mockPrismaService.ticket.create.mockResolvedValue(created);

      const result = await service.create(
        { type: 'GENERAL', price: '99.99', quantity: 100, eventId: 'event-001' },
        TEST_TENANT_ID,
      );

      expect(result).toEqual(created);
    });

    it('should reject negative price', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue({
        id: 'event-001',
        tenantId: TEST_TENANT_ID,
      });

      await expect(
        service.create(
          { type: 'GENERAL', price: '-10.00', quantity: 100, eventId: 'event-001' },
          TEST_TENANT_ID,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject ticket for non-existent event', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue(null);

      await expect(
        service.create(
          { type: 'GENERAL', price: '10.00', quantity: 100, eventId: 'missing' },
          TEST_TENANT_ID,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject ticket for event in different tenant', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue({
        id: 'event-001',
        tenantId: 'other-tenant',
      });

      await expect(
        service.create(
          { type: 'VIP', price: '299.99', quantity: 50, eventId: 'event-001' },
          TEST_TENANT_ID,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated tickets for event', async () => {
      const tickets = [
        { id: 'ticket-001', eventId: 'event-001' },
        { id: 'ticket-002', eventId: 'event-001' },
      ];
      mockPrismaService.ticket.findMany.mockResolvedValue(tickets);
      mockPrismaService.ticket.count.mockResolvedValue(2);

      const result = await service.findAll('event-001', { page: 1, pageSize: 20 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return ticket when found', async () => {
      const ticket = { id: 'ticket-001', type: 'VIP', price: '299.99' };
      mockPrismaService.ticket.findUnique.mockResolvedValue(ticket);

      const result = await service.findOne('ticket-001');
      expect(result).toEqual(ticket);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update ticket price with Decimal', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue({
        id: 'ticket-001',
        price: '99.99',
      });
      mockPrismaService.ticket.update.mockResolvedValue({
        id: 'ticket-001',
        price: '149.99',
      });

      const result = await service.update('ticket-001', { price: '149.99' });
      expect(result.price).toBe('149.99');
    });

    it('should reject negative price on update', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue({
        id: 'ticket-001',
        price: '99.99',
      });

      await expect(
        service.update('ticket-001', { price: '-5.00' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
