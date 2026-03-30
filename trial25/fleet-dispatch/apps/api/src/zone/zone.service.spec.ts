import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ZoneService } from './zone.service';
import { PrismaService } from '../infra/prisma.service';

describe('ZoneService', () => {
  let service: ZoneService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      zone: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      auditLog: { create: jest.fn() },
      setTenantContext: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ZoneService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ZoneService>(ZoneService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated zones', async () => {
      const mockData = [{ id: 'z1', name: 'Zone A', tenantId: 't1' }];
      prisma.zone.findMany.mockResolvedValue(mockData);
      prisma.zone.count.mockResolvedValue(1);

      const result = await service.findAll('t1', { page: 1, pageSize: 10 });

      expect(prisma.setTenantContext).toHaveBeenCalledWith('t1');
      expect(result.data).toEqual(mockData);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return zone when found', async () => {
      const mockZone = { id: 'z1', name: 'Zone A', tenantId: 't1' };
      prisma.zone.findFirst.mockResolvedValue(mockZone);

      const result = await service.findOne('z1', 't1');

      expect(prisma.setTenantContext).toHaveBeenCalledWith('t1');
      expect(result).toEqual(mockZone);
    });

    it('should throw NotFoundException', async () => {
      prisma.zone.findFirst.mockResolvedValue(null);
      await expect(service.findOne('x', 't1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a zone', async () => {
      const dto = { name: 'Zone A', description: 'Test zone', boundaries: { type: 'Polygon', coordinates: [] } };
      prisma.zone.create.mockResolvedValue({ id: 'z1', ...dto, tenantId: 't1' });

      const result = await service.create(dto, 't1', 'u1');

      expect(prisma.setTenantContext).toHaveBeenCalledWith('t1');
      expect(prisma.zone.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: 'Zone A', tenantId: 't1' }),
        }),
      );
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'CREATE', entity: 'Zone' }),
        }),
      );
      expect(result.id).toBe('z1');
    });
  });

  describe('update', () => {
    it('should update a zone', async () => {
      prisma.zone.findFirst.mockResolvedValue({ id: 'z1', name: 'Zone A', tenantId: 't1' });
      prisma.zone.update.mockResolvedValue({ id: 'z1', name: 'Zone B', tenantId: 't1' });

      const result = await service.update('z1', { name: 'Zone B' }, 't1', 'u1');

      expect(prisma.zone.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'z1' } }),
      );
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result.name).toBe('Zone B');
    });

    it('should update boundaries when provided', async () => {
      prisma.zone.findFirst.mockResolvedValue({ id: 'z1', name: 'Zone A', tenantId: 't1' });
      prisma.zone.update.mockResolvedValue({ id: 'z1', tenantId: 't1' });

      await service.update('z1', { boundaries: { type: 'Polygon', coordinates: [[0, 0]] } }, 't1', 'u1');

      expect(prisma.zone.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ boundaries: expect.anything() }),
        }),
      );
    });

    it('should throw if zone not found', async () => {
      prisma.zone.findFirst.mockResolvedValue(null);
      await expect(service.update('x', { name: 'Y' }, 't1', 'u1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a zone', async () => {
      prisma.zone.findFirst.mockResolvedValue({ id: 'z1', name: 'Zone A', tenantId: 't1' });

      const result = await service.remove('z1', 't1', 'u1');

      expect(prisma.zone.delete).toHaveBeenCalledWith({ where: { id: 'z1' } });
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'DELETE', entity: 'Zone' }),
        }),
      );
      expect(result.deleted).toBe(true);
    });

    it('should throw if zone not found', async () => {
      prisma.zone.findFirst.mockResolvedValue(null);
      await expect(service.remove('x', 't1', 'u1')).rejects.toThrow(NotFoundException);
    });
  });
});
