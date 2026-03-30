import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TicketService } from '../src/ticket/ticket.service';
import { PrismaService } from '../src/common/prisma.service';

// TRACED: EM-TICKET-005
describe('TicketService', () => {
  let service: TicketService;
  let prisma: {
    ticket: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
  };

  const tenantId = '550e8400-e29b-41d4-a716-446655440000';

  const mockTicket = {
    id: 'ticket-1',
    price: 99.99,
    type: 'General',
    status: 'AVAILABLE',
    eventId: 'event-1',
    tenantId,
    event: { id: 'event-1', title: 'Test Event' },
  };

  beforeEach(async () => {
    prisma = {
      ticket: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TicketService>(TicketService);
  });

  describe('create', () => {
    it('should create a ticket', async () => {
      const createDto = { price: 99.99, type: 'General', eventId: 'event-1' };
      prisma.ticket.create.mockResolvedValue(mockTicket);

      const result = await service.create(tenantId, createDto);

      expect(result).toEqual(mockTicket);
      expect(prisma.ticket.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            price: createDto.price,
            tenantId,
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated tickets', async () => {
      prisma.ticket.findMany.mockResolvedValue([mockTicket]);
      prisma.ticket.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId, 1, 20);

      expect(result.items).toEqual([mockTicket]);
      expect(result.total).toBe(1);
      expect(prisma.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a ticket by id', async () => {
      prisma.ticket.findFirst.mockResolvedValue(mockTicket);

      const result = await service.findOne(tenantId, 'ticket-1');

      expect(result).toEqual(mockTicket);
      expect(prisma.ticket.findFirst).toHaveBeenCalledWith({
        where: { id: 'ticket-1', tenantId },
        include: { event: true },
      });
    });

    it('should throw NotFoundException when ticket not found', async () => {
      prisma.ticket.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.ticket.findFirst).toHaveBeenCalledWith({
        where: { id: 'nonexistent', tenantId },
        include: { event: true },
      });
    });
  });

  describe('update', () => {
    it('should update ticket status', async () => {
      prisma.ticket.findFirst.mockResolvedValue(mockTicket);
      prisma.ticket.update.mockResolvedValue({ ...mockTicket, status: 'SOLD' });

      const result = await service.update(tenantId, 'ticket-1', { status: 'SOLD' });

      expect(result.status).toBe('SOLD');
      expect(prisma.ticket.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ticket-1' },
        }),
      );
    });
  });

  describe('remove', () => {
    it('should delete a ticket', async () => {
      prisma.ticket.findFirst.mockResolvedValue(mockTicket);
      prisma.ticket.delete.mockResolvedValue(mockTicket);

      const result = await service.remove(tenantId, 'ticket-1');

      expect(result).toEqual(mockTicket);
      expect(prisma.ticket.delete).toHaveBeenCalledWith({ where: { id: 'ticket-1' } });
    });

    it('should throw NotFoundException when removing nonexistent ticket', async () => {
      prisma.ticket.findFirst.mockResolvedValue(null);

      await expect(service.remove(tenantId, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.ticket.findFirst).toHaveBeenCalledWith({
        where: { id: 'nonexistent', tenantId },
        include: { event: true },
      });
    });
  });
});
