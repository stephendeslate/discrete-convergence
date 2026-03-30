import { Test, TestingModule } from '@nestjs/testing';
import { TicketTypeService } from './ticket-type.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  ticketType: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
};

describe('TicketTypeService', () => {
  let service: TicketTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketTypeService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<TicketTypeService>(TicketTypeService);
    jest.clearAllMocks();
  });

  it('should return paginated ticket types', async () => {
    mockPrisma.ticketType.findMany.mockResolvedValue([{ id: '1', name: 'VIP' }]);
    mockPrisma.ticketType.count.mockResolvedValue(1);
    const result = await service.findAll('t1', {});
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should throw NotFoundException for wrong tenant', async () => {
    mockPrisma.ticketType.findUnique.mockResolvedValue({ id: '1', tenantId: 'other' });
    await expect(service.findOne('1', 't1')).rejects.toThrow(NotFoundException);
  });

  it('should create ticket type with event', async () => {
    const dto = { name: 'VIP', price: 100, quantity: 50, eventId: 'e1' };
    mockPrisma.ticketType.create.mockResolvedValue({ id: '1', ...dto, tenantId: 't1' });
    const result = await service.create('t1', dto);
    expect(result.id).toBe('1');
    expect(mockPrisma.ticketType.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ tenantId: 't1', eventId: 'e1' }),
    });
  });
});
