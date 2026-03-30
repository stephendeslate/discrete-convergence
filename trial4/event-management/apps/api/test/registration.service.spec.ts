// TRACED:EM-TEST-009 — registration service unit test with mocked Prisma
import { RegistrationService } from '../src/registration/registration.service';
import { PrismaService } from '../src/common/prisma.service';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

describe('RegistrationService', () => {
  let service: RegistrationService;
  let prisma: {
    event: { findFirst: jest.Mock };
    ticketType: { findFirst: jest.Mock; update: jest.Mock };
    registration: { create: jest.Mock; findMany: jest.Mock; findFirst: jest.Mock; count: jest.Mock; update: jest.Mock };
    checkIn: { create: jest.Mock };
  };

  beforeEach(() => {
    prisma = {
      event: { findFirst: jest.fn() },
      ticketType: { findFirst: jest.fn(), update: jest.fn() },
      registration: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), count: jest.fn(), update: jest.fn() },
      checkIn: { create: jest.fn() },
    };
    service = new RegistrationService(prisma as unknown as PrismaService);
  });

  describe('register', () => {
    it('should throw NotFoundException when event not found', async () => {
      prisma.event.findFirst.mockResolvedValue(null);
      await expect(
        service.register('evt1', { ticketTypeId: 'tt1' }, 'user1', 'org1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when event not open', async () => {
      prisma.event.findFirst.mockResolvedValue({ id: 'evt1', status: 'DRAFT', organizationId: 'org1' });
      await expect(
        service.register('evt1', { ticketTypeId: 'tt1' }, 'user1', 'org1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when ticket sold out', async () => {
      prisma.event.findFirst.mockResolvedValue({ id: 'evt1', status: 'PUBLISHED', organizationId: 'org1' });
      prisma.ticketType.findFirst.mockResolvedValue({ id: 'tt1', quota: 10, sold: 10, eventId: 'evt1' });
      await expect(
        service.register('evt1', { ticketTypeId: 'tt1' }, 'user1', 'org1'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('checkIn', () => {
    it('should throw NotFoundException when registration not found', async () => {
      prisma.registration.findFirst.mockResolvedValue(null);
      await expect(service.checkIn('reg1', 'org1')).rejects.toThrow(NotFoundException);
    });

    it('should return already checked in message', async () => {
      prisma.registration.findFirst.mockResolvedValue({
        id: 'reg1',
        status: 'CONFIRMED',
        event: { organizationId: 'org1' },
        checkIn: { id: 'ci1', checkedInAt: new Date() },
      });
      const result = await service.checkIn('reg1', 'org1');
      expect((result as { message: string }).message).toBe('Already checked in');
    });
  });
});
