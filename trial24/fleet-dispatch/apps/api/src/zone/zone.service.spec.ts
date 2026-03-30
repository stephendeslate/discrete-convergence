// TRACED:ZONE-SERVICE-SPEC
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ZoneService } from './zone.service';
import { PrismaService } from '../infra/prisma.module';
import { CreateZoneDto } from './dto';

const mockPrisma = {
  zone: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  setCompanyId: jest.fn(),
};

describe('ZoneService', () => {
  let service: ZoneService;
  const companyId = 'c1';

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ZoneService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(ZoneService);
  });

  describe('findAll', () => {
    it('returns paginated zones', async () => {
      mockPrisma.zone.findMany.mockResolvedValue([{ id: 'z1' }]);
      mockPrisma.zone.count.mockResolvedValue(1);

      const result = await service.findAll(companyId, 1, 20);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(mockPrisma.setCompanyId).toHaveBeenCalledWith(companyId);
    });
  });

  describe('findOne', () => {
    it('returns a zone when found', async () => {
      mockPrisma.zone.findFirst.mockResolvedValue({ id: 'z1', name: 'Downtown', companyId });
      const result = await service.findOne('z1', companyId);
      expect(result.name).toBe('Downtown');
      expect(result.id).toBe('z1');
    });

    it('throws NotFoundException when zone not found (error path)', async () => {
      mockPrisma.zone.findFirst.mockResolvedValue(null);
      await expect(service.findOne('missing', companyId)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.zone.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'missing', companyId } }),
      );
    });
  });

  describe('create', () => {
    it('creates a zone with companyId and description', async () => {
      const dto: CreateZoneDto = { name: 'Uptown', description: 'Northern area', polygon: { type: 'Polygon', coordinates: [[0, 0], [1, 1]] } };
      mockPrisma.zone.create.mockResolvedValue({ id: 'z1', ...dto, companyId });

      const result = await service.create(dto, companyId);
      expect(result.name).toBe('Uptown');
      expect(mockPrisma.zone.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ name: 'Uptown', companyId }),
      });
    });

    it('creates zone with null description when not provided', async () => {
      const dto: CreateZoneDto = { name: 'Midtown', polygon: { type: 'Polygon', coordinates: [[0, 0], [1, 1]] } };
      mockPrisma.zone.create.mockResolvedValue({ id: 'z2', name: 'Midtown', description: null, companyId });

      const result = await service.create(dto, companyId);
      expect(result.description).toBeNull();
      expect(mockPrisma.zone.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ description: null }),
      });
    });
  });

  describe('update', () => {
    it('updates zone name', async () => {
      mockPrisma.zone.findFirst.mockResolvedValue({ id: 'z1', companyId });
      mockPrisma.zone.update.mockResolvedValue({ id: 'z1', name: 'New Name' });

      const result = await service.update('z1', { name: 'New Name' }, companyId);
      expect(result.name).toBe('New Name');
      expect(mockPrisma.zone.update).toHaveBeenCalledWith({
        where: { id: 'z1' },
        data: expect.objectContaining({ name: 'New Name' }),
      });
    });

    it('updates zone with partial fields (only description)', async () => {
      mockPrisma.zone.findFirst.mockResolvedValue({ id: 'z1', companyId });
      mockPrisma.zone.update.mockResolvedValue({ id: 'z1', description: 'Updated desc' });

      const result = await service.update('z1', { description: 'Updated desc' }, companyId);
      expect(result.description).toBe('Updated desc');
    });

    it('throws NotFoundException when updating non-existent zone (error path)', async () => {
      mockPrisma.zone.findFirst.mockResolvedValue(null);
      await expect(service.update('missing', { name: 'X' }, companyId)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.zone.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes a zone', async () => {
      mockPrisma.zone.findFirst.mockResolvedValue({ id: 'z1', companyId });
      mockPrisma.zone.delete.mockResolvedValue({ id: 'z1' });

      const result = await service.remove('z1', companyId);
      expect(result.id).toBe('z1');
      expect(mockPrisma.zone.delete).toHaveBeenCalledWith({ where: { id: 'z1' } });
    });

    it('throws NotFoundException when removing non-existent zone (error path)', async () => {
      mockPrisma.zone.findFirst.mockResolvedValue(null);
      await expect(service.remove('missing', companyId)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.zone.delete).not.toHaveBeenCalled();
    });
  });
});
