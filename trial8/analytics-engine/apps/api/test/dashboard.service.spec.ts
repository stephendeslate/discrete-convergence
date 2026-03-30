import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from '../src/dashboard/dashboard.service';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaModel } from './helpers/mock-prisma';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: Record<string, any>;

  beforeEach(async () => {
    prisma = {
      dashboard: createMockPrismaModel(),
      $executeRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  describe('create', () => {
    it('should create a dashboard with DRAFT status and set tenant context', async () => {
      prisma.dashboard.create.mockResolvedValue({ id: '1', title: 'Test', status: 'DRAFT', tenantId: 't1' });

      const result = await service.create('t1', { title: 'Test' });

      expect(prisma.$executeRaw).toHaveBeenCalled();
      expect(prisma.dashboard.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ title: 'Test', status: 'DRAFT', tenantId: 't1' }),
        }),
      );
      expect(result).toHaveProperty('id');
      expect(result.status).toBe('DRAFT');
    });
  });

  describe('findOne', () => {
    it('should return dashboard when found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: '1', title: 'Test', widgets: [] });

      const result = await service.findOne('t1', '1');

      expect(prisma.dashboard.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1', tenantId: 't1' } }),
      );
      expect(result).toHaveProperty('id', '1');
      expect(result).toHaveProperty('widgets');
    });

    it('should throw NotFoundException when dashboard not found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.findOne('t1', 'bad-id')).rejects.toThrow(NotFoundException);
      expect(prisma.dashboard.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'bad-id', tenantId: 't1' } }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated results with tenant scoping', async () => {
      const result = await service.findAll('t1', 1, 10);

      expect(prisma.$executeRaw).toHaveBeenCalled();
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('total');
    });
  });

  describe('update', () => {
    it('should update dashboard after verifying it exists', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: '1', title: 'Old', tenantId: 't1' });
      prisma.dashboard.update.mockResolvedValue({ id: '1', title: 'New' });

      const result = await service.update('t1', '1', { title: 'New' });

      expect(prisma.dashboard.findFirst).toHaveBeenCalled();
      expect(prisma.dashboard.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1' }, data: { title: 'New' } }),
      );
      expect(result.title).toBe('New');
    });

    it('should throw NotFoundException when updating non-existent dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.update('t1', 'bad', { title: 'X' })).rejects.toThrow(NotFoundException);
      expect(prisma.dashboard.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should archive dashboard instead of hard delete', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: '1', tenantId: 't1' });
      prisma.dashboard.update.mockResolvedValue({ id: '1', status: 'ARCHIVED' });

      const result = await service.remove('t1', '1');

      expect(prisma.dashboard.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'ARCHIVED' } }),
      );
      expect(result.status).toBe('ARCHIVED');
    });
  });
});
