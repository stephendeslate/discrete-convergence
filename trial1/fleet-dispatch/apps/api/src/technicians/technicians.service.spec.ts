// TRACED:FD-TEST-003 — Technicians service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TechniciansService } from './technicians.service';
import { PrismaService } from '../common/services/prisma.service';

describe('TechniciansService', () => {
  let service: TechniciansService;

  const mockPrisma = {
    technician: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $executeRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TechniciansService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TechniciansService>(TechniciansService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a technician with companyId', async () => {
      const dto = { name: 'John Doe', phone: '555-1234', skills: ['HVAC'] };
      const expected = { id: 'tech-1', ...dto, companyId: 'c1', isActive: true };
      mockPrisma.technician.create.mockResolvedValue(expected);

      const result = await service.create('c1', dto);

      expect(result).toEqual(expected);
      expect(mockPrisma.technician.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ companyId: 'c1', name: 'John Doe' }),
        }),
      );
    });

    it('should default skills to empty array when not provided', async () => {
      const dto = { name: 'Jane Doe' };
      mockPrisma.technician.create.mockResolvedValue({ id: 'tech-2', ...dto });

      await service.create('c1', dto);

      expect(mockPrisma.technician.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ skills: [] }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated technicians', async () => {
      const technicians = [{ id: 'tech-1' }, { id: 'tech-2' }];
      mockPrisma.technician.findMany.mockResolvedValue(technicians);
      mockPrisma.technician.count.mockResolvedValue(2);

      const result = await service.findAll('c1', 1, 10);

      expect(result.data).toEqual(technicians);
      expect(result.total).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return technician if found for the company', async () => {
      const tech = { id: 'tech-1', companyId: 'c1', name: 'John' };
      mockPrisma.technician.findUnique.mockResolvedValue(tech);

      const result = await service.findOne('c1', 'tech-1');

      expect(result).toEqual(tech);
    });

    it('should throw NotFoundException for wrong company', async () => {
      mockPrisma.technician.findUnique.mockResolvedValue({ id: 'tech-1', companyId: 'c2' });

      await expect(service.findOne('c1', 'tech-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.technician.findUnique.mockResolvedValue(null);

      await expect(service.findOne('c1', 'tech-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePosition', () => {
    it('should update GPS coordinates with Prisma.Decimal', async () => {
      const tech = { id: 'tech-1', companyId: 'c1' };
      mockPrisma.technician.findUnique.mockResolvedValue(tech);
      mockPrisma.technician.update.mockResolvedValue({
        ...tech,
        latitude: 40.7128,
        longitude: -74.006,
      });

      const result = await service.updatePosition('c1', 'tech-1', 40.7128, -74.006);

      expect(mockPrisma.technician.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            latitude: expect.anything(),
            longitude: expect.anything(),
          }),
        }),
      );
      expect(result.latitude).toBeDefined();
    });
  });

  describe('verifyRls', () => {
    it('should execute raw SQL for RLS verification', async () => {
      mockPrisma.$executeRaw.mockResolvedValue(1);

      const result = await service.verifyRls();

      expect(result).toBe(true);
      expect(mockPrisma.$executeRaw).toHaveBeenCalled();
    });
  });
});
