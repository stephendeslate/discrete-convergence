import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { TicketService } from '../src/ticket/ticket.service';
import { PrismaService } from '../src/common/prisma.service';
import { mockPrismaService, resetMocks, TEST_TENANT_ID } from './helpers/setup';
import { Test } from '@nestjs/testing';

describe('TicketService', () => {
  let service: TicketService;

  beforeEach(async () => {
    resetMocks();
    const module = await Test.createTestingModule({
      providers: [
        TicketService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();
    service = module.get(TicketService);
  });

  describe('create', () => {
    it('should create ticket with Decimal price', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue({
        id: 'evt-1',
        tenantId: TEST_TENANT_ID,
      });
      mockPrismaService.ticket.create.mockResolvedValue({
        id: 'tkt-1',
        type: 'VIP',
        price: new Decimal('299.99'),
        quantity: 100,
        sold: 0,
        eventId: 'evt-1',
      });

      const result = await service.create(
        { type: 'VIP', price: '299.99', quantity: 100, eventId: 'evt-1' },
        TEST_TENANT_ID,
      );

      expect(result.type).toBe('VIP');
      expect(result.price.toString()).toBe('299.99');
      expect(result.quantity).toBe(100);
    });

    it('should reject negative price', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue({
        id: 'evt-1',
        tenantId: TEST_TENANT_ID,
      });

      await expect(
        service.create(
          { type: 'GENERAL', price: '-10', quantity: 50, eventId: 'evt-1' },
          TEST_TENANT_ID,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if event not found', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue(null);

      await expect(
        service.create(
          { type: 'GENERAL', price: '50', quantity: 100, eventId: 'nonexistent' },
          TEST_TENANT_ID,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject if event belongs to different tenant', async () => {
      mockPrismaService.event.findUnique.mockResolvedValue({
        id: 'evt-1',
        tenantId: 'other-tenant',
      });

      await expect(
        service.create(
          { type: 'GENERAL', price: '50', quantity: 100, eventId: 'evt-1' },
          TEST_TENANT_ID,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should paginate tickets by eventId', async () => {
      mockPrismaService.ticket.findMany.mockResolvedValue([
        { id: 'tkt-1', type: 'GENERAL', price: new Decimal('50') },
      ]);
      mockPrismaService.ticket.count.mockResolvedValue(5);

      const result = await service.findAll('evt-1', { page: 1, pageSize: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(5);
      expect(result.meta.totalPages).toBe(1); // ceil(5/10)
    });
  });

  describe('update', () => {
    it('should reject negative price on update', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue({
        id: 'tkt-1',
        type: 'GENERAL',
        price: new Decimal('50'),
      });

      await expect(
        service.update('tkt-1', { price: '-5' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
