import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  waitlistEntry: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
  },
  user: { findFirst: jest.fn() },
  ticketType: { findFirst: jest.fn() },
  registration: { create: jest.fn() },
};

describe('WaitlistService', () => {
  let service: WaitlistService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        WaitlistService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(WaitlistService);
  });

  it('should return waitlist entries ordered by position', async () => {
    mockPrisma.waitlistEntry.findMany.mockResolvedValue([
      { id: 'w1', position: 1 }, { id: 'w2', position: 2 },
    ]);
    const result = await service.findAll('e1');
    expect(result).toHaveLength(2);
    expect(result[0].position).toBe(1);
  });

  it('should promote a waitlist entry', async () => {
    mockPrisma.waitlistEntry.findFirst.mockResolvedValue({ id: 'w1', email: 'a@b.com' });
    mockPrisma.user.findFirst.mockResolvedValue({ id: 'u1' });
    mockPrisma.ticketType.findFirst.mockResolvedValue({ id: 'tt1' });
    mockPrisma.registration.create.mockResolvedValue({ id: 'r1' });
    mockPrisma.waitlistEntry.delete.mockResolvedValue({});

    const result = await service.promote('e1', 'w1');
    expect(result.promoted).toBe(true);
  });

  it('should throw when waitlist entry not found', async () => {
    mockPrisma.waitlistEntry.findFirst.mockResolvedValue(null);
    await expect(service.promote('e1', 'missing')).rejects.toThrow(NotFoundException);
  });
});
