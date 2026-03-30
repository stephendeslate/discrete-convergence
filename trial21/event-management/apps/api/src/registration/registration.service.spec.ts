import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  event: { findUnique: jest.fn() },
  ticketType: { findFirst: jest.fn() },
  registration: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
  waitlistEntry: {
    findFirst: jest.fn(),
    delete: jest.fn(),
  },
  user: { findFirst: jest.fn() },
};

describe('RegistrationService', () => {
  let service: RegistrationService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        RegistrationService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(RegistrationService);
  });

  describe('register', () => {
    it('should register when event is open and not sold out', async () => {
      mockPrisma.ticketType.findFirst.mockResolvedValue({ id: 'tt1', quota: 100 });
      mockPrisma.event.findUnique.mockResolvedValue({ id: 'e1', status: 'REGISTRATION_OPEN' });
      mockPrisma.registration.count.mockResolvedValue(50);
      mockPrisma.registration.create.mockResolvedValue({ id: 'r1', status: 'CONFIRMED' });

      const result = await service.register('e1', 'u1', { ticketTypeId: 'tt1' });
      expect(result.status).toBe('CONFIRMED');
    });

    it('should reject when ticket type not found', async () => {
      mockPrisma.ticketType.findFirst.mockResolvedValue(null);
      await expect(
        service.register('e1', 'u1', { ticketTypeId: 'missing' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject when event not open for registration', async () => {
      mockPrisma.ticketType.findFirst.mockResolvedValue({ id: 'tt1', quota: 100 });
      mockPrisma.event.findUnique.mockResolvedValue({ id: 'e1', status: 'DRAFT' });
      await expect(
        service.register('e1', 'u1', { ticketTypeId: 'tt1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject when sold out', async () => {
      mockPrisma.ticketType.findFirst.mockResolvedValue({ id: 'tt1', quota: 10 });
      mockPrisma.event.findUnique.mockResolvedValue({ id: 'e1', status: 'REGISTRATION_OPEN' });
      mockPrisma.registration.count.mockResolvedValue(10);
      await expect(
        service.register('e1', 'u1', { ticketTypeId: 'tt1' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('should cancel a confirmed registration', async () => {
      mockPrisma.registration.findFirst.mockResolvedValue({
        id: 'r1', status: 'CONFIRMED', eventId: 'e1', ticketTypeId: 'tt1',
      });
      mockPrisma.registration.update.mockResolvedValue({ id: 'r1', status: 'CANCELLED' });
      mockPrisma.waitlistEntry.findFirst.mockResolvedValue(null);

      const result = await service.cancel('r1', 'u1');
      expect(result.status).toBe('CANCELLED');
    });

    it('should reject cancelling already cancelled', async () => {
      mockPrisma.registration.findFirst.mockResolvedValue({ id: 'r1', status: 'CANCELLED' });
      await expect(service.cancel('r1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('should reject cancelling after check-in', async () => {
      mockPrisma.registration.findFirst.mockResolvedValue({ id: 'r1', status: 'CHECKED_IN' });
      await expect(service.cancel('r1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('should throw when registration not found', async () => {
      mockPrisma.registration.findFirst.mockResolvedValue(null);
      await expect(service.cancel('missing', 'u1')).rejects.toThrow(NotFoundException);
    });
  });
});
