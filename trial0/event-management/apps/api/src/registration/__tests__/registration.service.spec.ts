// TRACED:EM-TEST-009 — Registration service unit tests with mocked Prisma
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegistrationService } from '../registration.service';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

const mockPrisma = {
  ticketType: { findFirst: vi.fn(), update: vi.fn() },
  registration: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn() },
  $transaction: vi.fn(),
};

describe('RegistrationService', () => {
  let service: RegistrationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new RegistrationService(mockPrisma as never);
  });

  it('should throw NotFoundException for invalid ticket type', async () => {
    mockPrisma.ticketType.findFirst.mockResolvedValue(null);
    await expect(
      service.register('event-1', { ticketTypeId: 'bad-id' }, 'user-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException for sold out ticket', async () => {
    mockPrisma.ticketType.findFirst.mockResolvedValue({ id: 'tt-1', quota: 10, soldCount: 10 });
    await expect(
      service.register('event-1', { ticketTypeId: 'tt-1' }, 'user-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw ConflictException for duplicate registration', async () => {
    mockPrisma.ticketType.findFirst.mockResolvedValue({ id: 'tt-1', quota: 10, soldCount: 5 });
    mockPrisma.registration.findFirst.mockResolvedValue({ id: 'existing' });
    await expect(
      service.register('event-1', { ticketTypeId: 'tt-1' }, 'user-1'),
    ).rejects.toThrow(ConflictException);
  });

  it('should cancel and decrement ticket count', async () => {
    mockPrisma.registration.findFirst.mockResolvedValue({
      id: 'reg-1',
      status: 'CONFIRMED',
      ticketTypeId: 'tt-1',
    });
    mockPrisma.$transaction.mockResolvedValue([{ status: 'CANCELLED' }, {}]);
    const result = await service.cancel('reg-1', 'user-1');
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('should reject cancelling already cancelled registration', async () => {
    mockPrisma.registration.findFirst.mockResolvedValue({ id: 'reg-1', status: 'CANCELLED' });
    await expect(service.cancel('reg-1', 'user-1')).rejects.toThrow(BadRequestException);
  });
});
