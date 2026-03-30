import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  registration: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('RegistrationService', () => {
  let service: RegistrationService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RegistrationService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(RegistrationService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated registrations for a tenant', async () => {
      const regs = [{ id: 'r-1', eventId: 'e-1', attendeeId: 'a-1', tenantId: 'tenant-1' }];
      mockPrisma.registration.findMany.mockResolvedValue(regs);
      mockPrisma.registration.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 10);
      expect(mockPrisma.registration.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
      );
      expect(result.data).toEqual(regs);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a registration by id and tenant', async () => {
      const reg = { id: 'r-1', tenantId: 'tenant-1' };
      mockPrisma.registration.findFirst.mockResolvedValue(reg);

      const result = await service.findOne('r-1', 'tenant-1');
      expect(mockPrisma.registration.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'r-1', tenantId: 'tenant-1' } }),
      );
      expect(result).toEqual(reg);
    });

    it('should throw NotFoundException when registration not found', async () => {
      mockPrisma.registration.findFirst.mockResolvedValue(null);
      await expect(service.findOne('bad', 'tenant-1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.registration.findFirst).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a registration with tenant scope', async () => {
      const dto = { eventId: 'e-1', attendeeId: 'a-1' };
      mockPrisma.registration.create.mockResolvedValue({ id: 'r-new', ...dto, status: 'PENDING', tenantId: 'tenant-1' });

      const result = await service.create(dto, 'tenant-1');
      expect(mockPrisma.registration.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ eventId: 'e-1', tenantId: 'tenant-1' }),
      });
      expect(result.status).toBe('PENDING');
    });
  });

  describe('update', () => {
    it('should update a registration status', async () => {
      mockPrisma.registration.findFirst.mockResolvedValue({ id: 'r-1', tenantId: 'tenant-1' });
      mockPrisma.registration.update.mockResolvedValue({ id: 'r-1', status: 'CONFIRMED', tenantId: 'tenant-1' });

      const result = await service.update('r-1', { status: 'CONFIRMED' }, 'tenant-1');
      expect(mockPrisma.registration.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'r-1' } }),
      );
      expect(result.status).toBe('CONFIRMED');
    });

    it('should throw NotFoundException when updating non-existent registration', async () => {
      mockPrisma.registration.findFirst.mockResolvedValue(null);
      await expect(service.update('bad', { status: 'CONFIRMED' }, 'tenant-1')).rejects.toThrow(NotFoundException);
      expect(mockPrisma.registration.findFirst).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a registration', async () => {
      mockPrisma.registration.findFirst.mockResolvedValue({ id: 'r-1', tenantId: 'tenant-1' });
      mockPrisma.registration.delete.mockResolvedValue({ id: 'r-1' });

      await service.remove('r-1', 'tenant-1');
      expect(mockPrisma.registration.delete).toHaveBeenCalledWith({ where: { id: 'r-1' } });
      expect(mockPrisma.registration.findFirst).toHaveBeenCalled();
    });
  });
});
