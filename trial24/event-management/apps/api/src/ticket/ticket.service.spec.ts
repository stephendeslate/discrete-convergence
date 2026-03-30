// TRACED:TICKET-SERVICE-SPEC
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { PrismaService } from '../infra/prisma.module';

const mockPrisma = {
  ticket: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('TicketService', () => {
  let service: TicketService;
  const orgId = '00000000-0000-0000-0000-000000000001';

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TicketService>(TicketService);
  });

  describe('create', () => {
    it('should create a ticket with organizationId', async () => {
      const dto = { type: 'VIP', price: '100.00', quantity: 50, eventId: 'e1' };
      mockPrisma.ticket.create.mockResolvedValue({ id: 't1', ...dto, organizationId: orgId });

      const result = await service.create(dto, orgId);
      expect(result.type).toBe('VIP');
      expect(result.organizationId).toBe(orgId);
      expect(mockPrisma.ticket.create).toHaveBeenCalledWith({
        data: { type: 'VIP', price: '100.00', quantity: 50, eventId: 'e1', organizationId: orgId },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated tickets', async () => {
      mockPrisma.ticket.findMany.mockResolvedValue([{ id: 't1' }]);
      mockPrisma.ticket.count.mockResolvedValue(1);

      const result = await service.findAll(orgId, 1, 10);
      expect(result.meta.total).toBe(1);
      expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { organizationId: orgId } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return ticket when found', async () => {
      mockPrisma.ticket.findFirst.mockResolvedValue({ id: 't1', type: 'VIP' });
      const result = await service.findOne('t1', orgId);
      expect(result.type).toBe('VIP');
      expect(result.id).toBe('t1');
    });

    it('should throw NotFoundException when ticket not found (error path)', async () => {
      mockPrisma.ticket.findFirst.mockResolvedValue(null);
      await expect(service.findOne('missing', orgId)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.ticket.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'missing', organizationId: orgId } }),
      );
    });
  });

  describe('update', () => {
    it('should update ticket type', async () => {
      mockPrisma.ticket.findFirst.mockResolvedValue({ id: 't1', organizationId: orgId });
      mockPrisma.ticket.update.mockResolvedValue({ id: 't1', type: 'GENERAL' });

      const result = await service.update('t1', { type: 'GENERAL' }, orgId);
      expect(result.type).toBe('GENERAL');
      expect(mockPrisma.ticket.update).toHaveBeenCalledWith({
        where: { id: 't1' },
        data: { type: 'GENERAL' },
      });
    });

    it('should update ticket with partial fields (only price)', async () => {
      mockPrisma.ticket.findFirst.mockResolvedValue({ id: 't1', organizationId: orgId });
      mockPrisma.ticket.update.mockResolvedValue({ id: 't1', price: '200.00' });

      const result = await service.update('t1', { price: '200.00' }, orgId);
      expect(result.price).toBe('200.00');
      expect(mockPrisma.ticket.update).toHaveBeenCalledWith({
        where: { id: 't1' },
        data: { price: '200.00' },
      });
    });

    it('should throw NotFoundException when updating non-existent ticket (error path)', async () => {
      mockPrisma.ticket.findFirst.mockResolvedValue(null);
      await expect(service.update('missing', { type: 'X' }, orgId)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.ticket.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a ticket', async () => {
      mockPrisma.ticket.findFirst.mockResolvedValue({ id: 't1', organizationId: orgId });
      mockPrisma.ticket.delete.mockResolvedValue({ id: 't1' });

      const result = await service.remove('t1', orgId);
      expect(result.deleted).toBe(true);
      expect(mockPrisma.ticket.delete).toHaveBeenCalledWith({ where: { id: 't1' } });
    });

    it('should throw NotFoundException when removing non-existent ticket (error path)', async () => {
      mockPrisma.ticket.findFirst.mockResolvedValue(null);
      await expect(service.remove('missing', orgId)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.ticket.delete).not.toHaveBeenCalled();
    });
  });
});
