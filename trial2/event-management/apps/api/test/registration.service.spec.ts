import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationService } from '../src/registration/registration.service';
import { PrismaService } from '../src/infra/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EventStatus, RegistrationStatus } from '@prisma/client';

// TRACED:EM-TEST-008 — Registration service unit tests with mocked Prisma

describe('RegistrationService', () => {
  let service: RegistrationService;
  let prisma: {
    event: {
      findUnique: jest.Mock;
    };
    registration: {
      create: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      event: {
        findUnique: jest.fn(),
      },
      registration: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<RegistrationService>(RegistrationService);
  });

  describe('register', () => {
    it('should create registration for open event', async () => {
      const event = {
        id: 'event-1',
        organizationId: 'org-1',
        status: EventStatus.REGISTRATION_OPEN,
        capacity: 100,
        registrations: [],
      };
      prisma.event.findUnique.mockResolvedValue(event);
      prisma.registration.findFirst.mockResolvedValue(null);

      const expected = {
        id: 'reg-1',
        userId: 'user-1',
        eventId: 'event-1',
        status: RegistrationStatus.CONFIRMED,
      };
      prisma.registration.create.mockResolvedValue(expected);

      const result = await service.register(
        { eventId: 'event-1' },
        'user-1',
        'org-1',
      );
      expect(result.status).toBe(RegistrationStatus.CONFIRMED);
    });

    it('should reject registration for draft event', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-1',
        organizationId: 'org-1',
        status: EventStatus.DRAFT,
        capacity: 100,
        registrations: [],
      });

      await expect(
        service.register({ eventId: 'event-1' }, 'user-1', 'org-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject duplicate registration', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-1',
        organizationId: 'org-1',
        status: EventStatus.REGISTRATION_OPEN,
        capacity: 100,
        registrations: [],
      });
      prisma.registration.findFirst.mockResolvedValue({
        id: 'existing',
        status: RegistrationStatus.CONFIRMED,
      });

      await expect(
        service.register({ eventId: 'event-1' }, 'user-1', 'org-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject registration when event at capacity', async () => {
      const registrations = Array.from({ length: 5 }, (_, i) => ({
        id: `reg-${i}`,
        status: RegistrationStatus.CONFIRMED,
      }));

      prisma.event.findUnique.mockResolvedValue({
        id: 'event-1',
        organizationId: 'org-1',
        status: EventStatus.REGISTRATION_OPEN,
        capacity: 5,
        registrations,
      });
      prisma.registration.findFirst.mockResolvedValue(null);

      await expect(
        service.register({ eventId: 'event-1' }, 'user-1', 'org-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for wrong org', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'event-1',
        organizationId: 'org-2',
      });

      await expect(
        service.register({ eventId: 'event-1' }, 'user-1', 'org-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancel', () => {
    it('should cancel a confirmed registration', async () => {
      prisma.registration.findUnique.mockResolvedValue({
        id: 'reg-1',
        organizationId: 'org-1',
        status: RegistrationStatus.CONFIRMED,
      });
      prisma.registration.update.mockResolvedValue({
        id: 'reg-1',
        status: RegistrationStatus.CANCELLED,
      });

      const result = await service.cancel('reg-1', 'org-1');
      expect(result.status).toBe(RegistrationStatus.CANCELLED);
    });

    it('should reject cancelling an already cancelled registration', async () => {
      prisma.registration.findUnique.mockResolvedValue({
        id: 'reg-1',
        organizationId: 'org-1',
        status: RegistrationStatus.CANCELLED,
      });

      await expect(service.cancel('reg-1', 'org-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject cancelling a checked-in registration', async () => {
      prisma.registration.findUnique.mockResolvedValue({
        id: 'reg-1',
        organizationId: 'org-1',
        status: RegistrationStatus.CHECKED_IN,
      });

      await expect(service.cancel('reg-1', 'org-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException for wrong org', async () => {
      prisma.registration.findUnique.mockResolvedValue({
        id: 'reg-1',
        organizationId: 'org-2',
        status: RegistrationStatus.CONFIRMED,
      });

      await expect(service.cancel('reg-1', 'org-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
