import { Test, TestingModule } from '@nestjs/testing';
import { TicketService } from './ticket.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  ticket: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
};

describe('TicketService', () => {
  let service: TicketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<TicketService>(TicketService);
    jest.clearAllMocks();
  });

  it('should return paginated tickets', async () => {
    mockPrisma.ticket.findMany.mockResolvedValue([{ id: '1' }]);
    mockPrisma.ticket.count.mockResolvedValue(1);
    const result = await service.findAll('t1', { page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should throw NotFoundException for missing ticket', async () => {
    mockPrisma.ticket.findUnique.mockResolvedValue(null);
    await expect(service.findOne('x', 't1')).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException for wrong tenant', async () => {
    mockPrisma.ticket.findUnique.mockResolvedValue({ id: '1', tenantId: 'other' });
    await expect(service.findOne('1', 't1')).rejects.toThrow(NotFoundException);
  });

  it('should create ticket with status casting', async () => {
    const dto = { price: 50, eventId: 'e1', ticketTypeId: 'tt1' };
    mockPrisma.ticket.create.mockResolvedValue({ id: '1', ...dto, status: 'AVAILABLE' });
    const result = await service.create('t1', dto);
    expect(result.status).toBe('AVAILABLE');
    expect(mockPrisma.ticket.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ tenantId: 't1', eventId: 'e1' }),
    });
  });
});
