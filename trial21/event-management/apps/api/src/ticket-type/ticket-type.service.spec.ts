import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TicketTypeService } from './ticket-type.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  event: { findFirst: jest.fn() },
  ticketType: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('TicketTypeService', () => {
  let service: TicketTypeService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        TicketTypeService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(TicketTypeService);
  });

  it('should create a ticket type with price in cents', async () => {
    mockPrisma.event.findFirst.mockResolvedValue({ id: 'e1' });
    mockPrisma.ticketType.create.mockResolvedValue({
      id: 'tt1', name: 'VIP', price: 5000, quota: 100,
    });
    const result = await service.create('e1', { name: 'VIP', price: 5000, quota: 100 }, 'org1');
    expect(result.price).toBe(5000);
    expect(result.name).toBe('VIP');
  });

  it('should throw when event not found', async () => {
    mockPrisma.event.findFirst.mockResolvedValue(null);
    await expect(
      service.create('missing', { name: 'VIP', price: 5000, quota: 100 }, 'org1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should find all ticket types for event', async () => {
    mockPrisma.event.findFirst.mockResolvedValue({ id: 'e1' });
    mockPrisma.ticketType.findMany.mockResolvedValue([{ id: 'tt1' }]);
    const result = await service.findAll('e1', 'org1');
    expect(result).toHaveLength(1);
  });

  it('should throw when ticket type not found', async () => {
    mockPrisma.event.findFirst.mockResolvedValue({ id: 'e1' });
    mockPrisma.ticketType.findFirst.mockResolvedValue(null);
    await expect(service.findOne('e1', 'missing', 'org1')).rejects.toThrow(NotFoundException);
  });
});
