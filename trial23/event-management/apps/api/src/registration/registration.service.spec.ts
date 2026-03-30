import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { PrismaService } from '../infra/prisma.service';

describe('RegistrationService', () => {
  let service: RegistrationService;
  let prisma: {
    event: { findFirst: jest.Mock };
    registration: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      event: { findFirst: jest.fn() },
      registration: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
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

  it('should register for an event', async () => {
    const event = { id: 'evt-1', organizationId: 'org-1' };
    prisma.event.findFirst.mockResolvedValue(event);
    const dto = { ticketTypeId: 'tt-1', attendeeName: 'Alice', attendeeEmail: 'alice@test.com' };
    const expected = { id: 'reg-1', ...dto, eventId: 'evt-1', status: 'PENDING' };
    prisma.registration.create.mockResolvedValue(expected);

    const result = await service.register('org-1', 'evt-1', dto);
    expect(result).toEqual(expected);
    expect(result.status).toBe('PENDING');
  });

  it('should throw NotFoundException when registering for invalid event', async () => {
    prisma.event.findFirst.mockResolvedValue(null);
    const dto = { ticketTypeId: 'tt-1', attendeeName: 'Alice', attendeeEmail: 'alice@test.com' };

    await expect(service.register('org-1', 'evt-999', dto)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException on registration error', async () => {
    const event = { id: 'evt-1', organizationId: 'org-1' };
    prisma.event.findFirst.mockResolvedValue(event);
    prisma.registration.create.mockRejectedValue(new Error('Unique constraint failed'));
    const dto = { ticketTypeId: 'tt-1', attendeeName: 'Alice', attendeeEmail: 'alice@test.com' };

    await expect(service.register('org-1', 'evt-1', dto)).rejects.toThrow(BadRequestException);
  });

  it('should list registrations by event with pagination', async () => {
    const event = { id: 'evt-1', organizationId: 'org-1' };
    prisma.event.findFirst.mockResolvedValue(event);
    prisma.registration.findMany.mockResolvedValue([{ id: 'reg-1' }]);
    prisma.registration.count.mockResolvedValue(1);

    const result = await service.findAllByEvent('org-1', 'evt-1', 1, 10);
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should throw NotFoundException when listing registrations for invalid event', async () => {
    prisma.event.findFirst.mockResolvedValue(null);

    await expect(service.findAllByEvent('org-1', 'evt-999')).rejects.toThrow(NotFoundException);
  });

  it('should cancel a registration', async () => {
    const registration = { id: 'reg-1', organizationId: 'org-1', status: 'PENDING' };
    prisma.registration.findFirst.mockResolvedValue(registration);
    prisma.registration.update.mockResolvedValue({ ...registration, status: 'CANCELLED' });

    const result = await service.cancel('org-1', 'reg-1');
    expect(result.status).toBe('CANCELLED');
  });

  it('should throw NotFoundException when cancelling non-existent registration', async () => {
    prisma.registration.findFirst.mockResolvedValue(null);

    await expect(service.cancel('org-1', 'reg-999')).rejects.toThrow(NotFoundException);
  });
});
