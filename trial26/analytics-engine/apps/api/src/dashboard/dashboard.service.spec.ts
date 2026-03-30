import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../infra/prisma.service';

// TRACED: AE-DASH-001 — Create dashboard
// TRACED: AE-DASH-006 — Publish dashboard
// TRACED: AE-EDGE-001 — Empty dashboard name
// TRACED: AE-EDGE-002 — Duplicate dashboard name for tenant

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  beforeEach(async () => {
    prisma = {
      dashboard: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
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
      prisma.dashboard.create.mockResolvedValue({ id: 'dash-1', name: 'Test', status: 'DRAFT' });

      const result = await service.create('tenant-1', { name: 'Test' });
      expect(result.name).toBe('Test');
    });

    it('should throw BadRequestException for empty dashboard name', async () => {
      await expect(service.create('tenant-1', { name: '' })).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException for duplicate dashboard name', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(service.create('tenant-1', { name: 'Existing' })).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when dashboard not found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.findOne('tenant-1', 'missing-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('publish', () => {
    it('should publish a draft dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1', status: 'DRAFT', tenantId: 'tenant-1', widgets: [] });
      prisma.dashboard.update.mockResolvedValue({ id: 'dash-1', status: 'PUBLISHED' });

      const result = await service.publish('tenant-1', 'dash-1');
      expect(result.status).toBe('PUBLISHED');
    });

    it('should throw BadRequestException when publishing non-draft dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1', status: 'PUBLISHED', tenantId: 'tenant-1', widgets: [] });

      await expect(service.publish('tenant-1', 'dash-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('archive', () => {
    it('should throw BadRequestException when archiving already archived dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1', status: 'ARCHIVED', tenantId: 'tenant-1', widgets: [] });

      await expect(service.archive('tenant-1', 'dash-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should throw BadRequestException when updating archived dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1', status: 'ARCHIVED', tenantId: 'tenant-1', widgets: [] });

      await expect(service.update('tenant-1', 'dash-1', { name: 'Updated' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      prisma.dashboard.findMany.mockResolvedValue([]);
      prisma.dashboard.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-1', 1, 10);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('totalPages');
    });
  });
});
