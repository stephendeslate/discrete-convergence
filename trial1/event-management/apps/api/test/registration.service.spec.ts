import { RegistrationService } from '../src/registration/registration.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('RegistrationService', () => {
  let service: RegistrationService;
  const mockPrisma = {
    $executeRaw: jest.fn(),
    event: { findFirst: jest.fn() },
    ticketType: { findFirst: jest.fn() },
    registration: { create: jest.fn(), findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
  };

  beforeEach(() => {
    service = new RegistrationService(mockPrisma as never);
    jest.clearAllMocks();
  });

  it('throws NotFoundException when event not found', async () => {
    mockPrisma.event.findFirst.mockResolvedValue(null);
    await expect(service.register('org1', 'bad', 'user1', 'tt1')).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when event not open', async () => {
    mockPrisma.event.findFirst.mockResolvedValue({ id: '1', status: 'DRAFT', organizationId: 'org1' });
    await expect(service.register('org1', '1', 'user1', 'tt1')).rejects.toThrow(BadRequestException);
  });

  it('creates waitlisted registration when capacity full', async () => {
    mockPrisma.event.findFirst.mockResolvedValue({ id: '1', status: 'REGISTRATION_OPEN', organizationId: 'org1' });
    mockPrisma.ticketType.findFirst.mockResolvedValue({ id: 'tt1', quota: 1, eventId: '1' });
    mockPrisma.registration.count.mockResolvedValue(1);
    mockPrisma.registration.create.mockResolvedValue({ id: 'r1', status: 'WAITLISTED' });
    const result = await service.register('org1', '1', 'user1', 'tt1');
    expect(result.status).toBe('WAITLISTED');
  });
});
