import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { PrismaService } from '../infra/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';

jest.mock('@event-management/shared', () => ({
  BCRYPT_SALT_ROUNDS: 10,
  APP_VERSION: '1.0.0',
}));

jest.mock('../common/pagination.utils', () => ({
  getPaginationParams: jest
    .fn()
    .mockReturnValue({ skip: 0, take: 10, page: 1, pageSize: 10 }),
}));

const mockPrisma = {
  registration: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('RegistrationService', () => {
  let service: RegistrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RegistrationService>(RegistrationService);
    jest.clearAllMocks();
  });

  const tenantId = 'tenant-1';

  describe('create', () => {
    it('should create a registration with tenantId', async () => {
      const dto = {
        eventId: 'event-1',
        attendeeId: 'attendee-1',
        status: 'PENDING',
      };
      const expected = { id: 'reg-1', ...dto, tenantId };
      mockPrisma.registration.create.mockResolvedValue(expected);

      const result = await service.create(tenantId, dto as CreateRegistrationDto);

      expect(result).toEqual(expected);
      expect(mockPrisma.registration.create).toHaveBeenCalledWith({
        data: {
          eventId: dto.eventId,
          attendeeId: dto.attendeeId,
          status: dto.status,
          tenantId,
        },
        include: { event: true, attendee: true },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated registrations with count', async () => {
      const registrations = [{ id: 'reg-1' }];
      mockPrisma.registration.findMany.mockResolvedValue(registrations);
      mockPrisma.registration.count.mockResolvedValue(1);

      const result = await service.findAll(tenantId);

      expect(result).toEqual({
        data: registrations,
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });
      expect(mockPrisma.registration.findMany).toHaveBeenCalledWith({
        where: { tenantId },
        include: { event: true, attendee: true },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return registration when found', async () => {
      const registration = { id: 'reg-1', tenantId };
      mockPrisma.registration.findFirst.mockResolvedValue(registration);

      const result = await service.findOne(tenantId, 'reg-1');

      expect(result).toEqual(registration);
      expect(mockPrisma.registration.findFirst).toHaveBeenCalledWith({
        where: { id: 'reg-1', tenantId },
        include: { event: true, attendee: true },
      });
    });

    it('should throw NotFoundException when registration not found', async () => {
      mockPrisma.registration.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.registration.findFirst).toHaveBeenCalledWith({
        where: { id: 'missing', tenantId },
        include: { event: true, attendee: true },
      });
    });
  });

  describe('update', () => {
    it('should find then update registration with status', async () => {
      const registration = { id: 'reg-1', tenantId };
      mockPrisma.registration.findFirst.mockResolvedValue(registration);
      mockPrisma.registration.update.mockResolvedValue({
        ...registration,
        status: 'CONFIRMED',
      });

      const dto = { status: 'CONFIRMED' };
      const result = await service.update(tenantId, 'reg-1', dto as UpdateRegistrationDto);

      expect(result.status).toBe('CONFIRMED');
      expect(mockPrisma.registration.update).toHaveBeenCalledWith({
        where: { id: 'reg-1' },
        data: { status: 'CONFIRMED' },
        include: { event: true, attendee: true },
      });
    });
  });
});
