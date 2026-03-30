import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TicketService } from '../src/ticket/ticket.service';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaService } from './helpers/mock-prisma';

describe('TicketService', () => {
  let service: TicketService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  const tenantId = 'tenant-1';
  const mockTicket = {
    id: 'ticket-1',
    name: 'General Admission',
    price: new Prisma.Decimal(99.99),
    quantity: 100,
    sold: 25,
    status: 'AVAILABLE',
    eventId: 'event-1',
    tenantId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEvent = {
    id: 'event-1',
    title: 'Test Event',
    status: 'PUBLISHED',
    tenantId,
  };

  beforeEach(async () => {
    prisma = createMockPrismaService();
    prisma.$executeRaw.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TicketService>(TicketService);
  });

  describe('create', () => {
    it('should create a ticket for a published event', async () => {
      const dto = { name: 'VIP', price: 199.99, quantity: 50, eventId: 'event-1' };
      prisma.event.findFirst.mockResolvedValue(mockEvent);
      prisma.ticket.create.mockResolvedValue({ ...mockTicket, ...dto });

      const result = await service.create(tenantId, dto);
      expect(result.name).toBe(dto.name);
      expect(prisma.event.findFirst).toHaveBeenCalledWith({
        where: { id: dto.eventId, tenantId },
      });
      expect(prisma.ticket.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: dto.name,
          tenantId,
        }),
      });
    });

    it('should throw NotFoundException if event does not exist', async () => {
      prisma.event.findFirst.mockResolvedValue(null);

      await expect(service.create(tenantId, { name: 'VIP', price: 199, quantity: 50, eventId: 'no-event' }))
        .rejects.toThrow(NotFoundException);
      expect(prisma.event.findFirst).toHaveBeenCalledWith({
        where: { id: 'no-event', tenantId },
      });
    });

    it('should throw BadRequestException for cancelled event', async () => {
      prisma.event.findFirst.mockResolvedValue({ ...mockEvent, status: 'CANCELLED' });

      await expect(service.create(tenantId, { name: 'VIP', price: 199, quantity: 50, eventId: 'event-1' }))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return ticket by id and tenant', async () => {
      prisma.ticket.findFirst.mockResolvedValue(mockTicket);

      const result = await service.findOne(tenantId, 'ticket-1');
      expect(result.id).toBe('ticket-1');
      expect(prisma.ticket.findFirst).toHaveBeenCalledWith({
        where: { id: 'ticket-1', tenantId },
        include: { event: true },
      });
    });

    it('should throw NotFoundException if ticket not found', async () => {
      prisma.ticket.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'nonexistent'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update ticket fields', async () => {
      prisma.ticket.findFirst.mockResolvedValue(mockTicket);
      prisma.ticket.update.mockResolvedValue({ ...mockTicket, name: 'Updated' });

      const result = await service.update(tenantId, 'ticket-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
      expect(prisma.ticket.update).toHaveBeenCalledWith({
        where: { id: 'ticket-1' },
        data: expect.objectContaining({ name: 'Updated' }),
      });
    });

    it('should throw BadRequestException when reducing quantity below sold count', async () => {
      prisma.ticket.findFirst.mockResolvedValue(mockTicket);

      await expect(service.update(tenantId, 'ticket-1', { quantity: 10 }))
        .rejects.toThrow(BadRequestException);
      expect(prisma.ticket.findFirst).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should set ticket status to CANCELLED', async () => {
      prisma.ticket.findFirst.mockResolvedValue(mockTicket);
      prisma.ticket.update.mockResolvedValue({ ...mockTicket, status: 'CANCELLED' });

      const result = await service.remove(tenantId, 'ticket-1');
      expect(result.status).toBe('CANCELLED');
      expect(prisma.ticket.update).toHaveBeenCalledWith({
        where: { id: 'ticket-1' },
        data: { status: 'CANCELLED' },
      });
    });
  });
});
