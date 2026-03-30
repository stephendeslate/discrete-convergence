import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { RegistrationService } from '../src/registration/registration.service';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaService } from './helpers/mock-prisma';

describe('RegistrationService', () => {
  let service: RegistrationService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  const tenantId = 'tenant-1';
  const mockRegistration = {
    id: 'reg-1',
    status: 'PENDING',
    eventId: 'event-1',
    userId: 'user-1',
    tenantId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEvent = {
    id: 'event-1',
    title: 'Test Event',
    status: 'PUBLISHED',
    tenantId,
  };

  beforeEach(async () => {
    prisma = createMockPrismaService();
    prisma.$executeRaw.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<RegistrationService>(RegistrationService);
  });

  describe('create', () => {
    it('should create a registration for a published event', async () => {
      const dto = { eventId: 'event-1', userId: 'user-1' };
      prisma.event.findFirst.mockResolvedValue(mockEvent);
      prisma.registration.create.mockResolvedValue(mockRegistration);

      const result = await service.create(tenantId, dto);
      expect(result.status).toBe('PENDING');
      expect(prisma.event.findFirst).toHaveBeenCalledWith({
        where: { id: dto.eventId, tenantId },
      });
      expect(prisma.registration.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventId: dto.eventId,
          userId: dto.userId,
          tenantId,
          status: 'PENDING',
        }),
      });
    });

    it('should throw NotFoundException if event does not exist', async () => {
      prisma.event.findFirst.mockResolvedValue(null);

      await expect(service.create(tenantId, { eventId: 'no-event', userId: 'user-1' }))
        .rejects.toThrow(NotFoundException);
      expect(prisma.event.findFirst).toHaveBeenCalledWith({
        where: { id: 'no-event', tenantId },
      });
    });

    it('should throw BadRequestException for non-published event', async () => {
      prisma.event.findFirst.mockResolvedValue({ ...mockEvent, status: 'DRAFT' });

      await expect(service.create(tenantId, { eventId: 'event-1', userId: 'user-1' }))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return registration by id and tenant', async () => {
      prisma.registration.findFirst.mockResolvedValue(mockRegistration);

      const result = await service.findOne(tenantId, 'reg-1');
      expect(result.id).toBe('reg-1');
      expect(prisma.registration.findFirst).toHaveBeenCalledWith({
        where: { id: 'reg-1', tenantId },
        include: { event: true, user: true },
      });
    });

    it('should throw NotFoundException if registration not found', async () => {
      prisma.registration.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'nonexistent'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update registration status', async () => {
      prisma.registration.findFirst.mockResolvedValue(mockRegistration);
      prisma.registration.update.mockResolvedValue({ ...mockRegistration, status: 'CONFIRMED' });

      const result = await service.update(tenantId, 'reg-1', { status: 'CONFIRMED' });
      expect(result.status).toBe('CONFIRMED');
      expect(prisma.registration.update).toHaveBeenCalledWith({
        where: { id: 'reg-1' },
        data: { status: 'CONFIRMED' },
      });
    });

    it('should throw BadRequestException when cancelling already cancelled registration', async () => {
      prisma.registration.findFirst.mockResolvedValue({ ...mockRegistration, status: 'CANCELLED' });

      await expect(service.update(tenantId, 'reg-1', { status: 'CANCELLED' }))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should set registration status to CANCELLED', async () => {
      prisma.registration.findFirst.mockResolvedValue(mockRegistration);
      prisma.registration.update.mockResolvedValue({ ...mockRegistration, status: 'CANCELLED' });

      const result = await service.remove(tenantId, 'reg-1');
      expect(result.status).toBe('CANCELLED');
      expect(prisma.registration.update).toHaveBeenCalledWith({
        where: { id: 'reg-1' },
        data: { status: 'CANCELLED' },
      });
    });
  });
});
