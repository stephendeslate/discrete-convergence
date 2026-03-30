import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RegistrationService } from '../src/registration/registration.service';
import { PrismaService } from '../src/infra/prisma.service';

const mockPrisma = {
  registration: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
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

  describe('create', () => {
    it('should create a registration with tenant scoping', async () => {
      const dto = { eventId: 'event-1', attendeeId: 'attendee-1' };
      const expected = { id: '1', eventId: 'event-1', attendeeId: 'attendee-1', tenantId: 'tenant-1', status: 'PENDING' };
      mockPrisma.registration.create.mockResolvedValue(expected);

      const result = await service.create('tenant-1', dto);

      expect(result).toEqual(expected);
      expect(mockPrisma.registration.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ eventId: 'event-1', attendeeId: 'attendee-1', tenantId: 'tenant-1' }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated registrations', async () => {
      const registrations = [{ id: '1', status: 'PENDING', tenantId: 'tenant-1' }];
      mockPrisma.registration.findMany.mockResolvedValue(registrations);
      mockPrisma.registration.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 10);

      expect(result.data).toEqual(registrations);
      expect(mockPrisma.registration.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return registration by id', async () => {
      const reg = { id: '1', status: 'PENDING', tenantId: 'tenant-1' };
      mockPrisma.registration.findFirst.mockResolvedValue(reg);

      const result = await service.findOne('tenant-1', '1');

      expect(result).toEqual(reg);
      expect(mockPrisma.registration.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1', tenantId: 'tenant-1' } }),
      );
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.registration.findFirst.mockResolvedValue(null);

      await expect(service.findOne('tenant-1', 'missing')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.registration.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'missing', tenantId: 'tenant-1' } }),
      );
    });
  });

  describe('update', () => {
    it('should update registration status', async () => {
      mockPrisma.registration.findFirst.mockResolvedValue({ id: '1', status: 'PENDING', tenantId: 'tenant-1' });
      mockPrisma.registration.update.mockResolvedValue({ id: '1', status: 'CONFIRMED', tenantId: 'tenant-1' });

      const result = await service.update('tenant-1', '1', { status: 'CONFIRMED' });

      expect(result.status).toBe('CONFIRMED');
      expect(mockPrisma.registration.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1' } }),
      );
    });
  });

  describe('remove', () => {
    it('should delete a registration', async () => {
      mockPrisma.registration.findFirst.mockResolvedValue({ id: '1', tenantId: 'tenant-1' });
      mockPrisma.registration.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('tenant-1', '1');

      expect(result.id).toBe('1');
      expect(mockPrisma.registration.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException when deleting non-existent registration', async () => {
      mockPrisma.registration.findFirst.mockResolvedValue(null);

      await expect(service.remove('tenant-1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });
});
