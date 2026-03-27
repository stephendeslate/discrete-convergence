import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../infra/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: {
    dashboard: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      dashboard: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  describe('create', () => {
    it('should create a dashboard with valid data', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);
      prisma.dashboard.create.mockResolvedValue({
        id: 'dash-1',
        name: 'My Dashboard',
        tenantId: 'tenant-1',
        status: 'DRAFT',
      });

      const result = await service.create('tenant-1', { name: 'My Dashboard' });
      expect(result.name).toBe('My Dashboard');
      expect(result.status).toBe('DRAFT');
    });

    it('should throw ConflictException for duplicate name', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(
        service.create('tenant-1', { name: 'Existing Dashboard' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated dashboards', async () => {
      prisma.dashboard.findMany.mockResolvedValue([{ id: 'dash-1' }]);
      prisma.dashboard.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 10);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should return empty list when no dashboards exist', async () => {
      prisma.dashboard.findMany.mockResolvedValue([]);
      prisma.dashboard.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1');
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return dashboard by ID', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        name: 'Dashboard',
        tenantId: 'tenant-1',
      });

      const result = await service.findOne('tenant-1', 'dash-1');
      expect(result.id).toBe('dash-1');
    });

    it('should throw NotFoundException when dashboard not found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne('tenant-1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('publish', () => {
    it('should publish a draft dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        status: 'DRAFT',
        tenantId: 'tenant-1',
      });
      prisma.dashboard.update.mockResolvedValue({
        id: 'dash-1',
        status: 'PUBLISHED',
      });

      const result = await service.publish('tenant-1', 'dash-1');
      expect(result.status).toBe('PUBLISHED');
    });

    it('should throw BadRequestException when publishing non-draft dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        status: 'PUBLISHED',
        tenantId: 'tenant-1',
      });

      await expect(
        service.publish('tenant-1', 'dash-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('archive', () => {
    it('should archive a dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        status: 'PUBLISHED',
        tenantId: 'tenant-1',
      });
      prisma.dashboard.update.mockResolvedValue({
        id: 'dash-1',
        status: 'ARCHIVED',
      });

      const result = await service.archive('tenant-1', 'dash-1');
      expect(result.status).toBe('ARCHIVED');
    });

    it('should throw BadRequestException when archiving already archived dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        status: 'ARCHIVED',
        tenantId: 'tenant-1',
      });

      await expect(
        service.archive('tenant-1', 'dash-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a draft dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        status: 'DRAFT',
        tenantId: 'tenant-1',
      });
      prisma.dashboard.delete.mockResolvedValue({ id: 'dash-1' });

      const result = await service.remove('tenant-1', 'dash-1');
      expect(result.id).toBe('dash-1');
    });

    it('should throw BadRequestException when deleting published dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        status: 'PUBLISHED',
        tenantId: 'tenant-1',
      });

      await expect(
        service.remove('tenant-1', 'dash-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        status: 'DRAFT',
        tenantId: 'tenant-1',
      });
      prisma.dashboard.update.mockResolvedValue({
        id: 'dash-1',
        name: 'Updated',
      });

      const result = await service.update('tenant-1', 'dash-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('should throw BadRequestException when updating archived dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        status: 'ARCHIVED',
        tenantId: 'tenant-1',
      });

      await expect(
        service.update('tenant-1', 'dash-1', { name: 'Updated' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
