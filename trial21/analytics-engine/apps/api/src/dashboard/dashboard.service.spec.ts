import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: {
    dashboard: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      dashboard: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a dashboard', async () => {
      prisma.dashboard.create.mockResolvedValue({ id: '1', title: 'Test' });
      const result = await service.create('t1', 'u1', { title: 'Test' });
      expect(prisma.dashboard.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ title: 'Test', tenantId: 't1', createdById: 'u1' }),
      }));
      expect(result.id).toBe('1');
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      prisma.dashboard.findMany.mockResolvedValue([{ id: '1' }]);
      prisma.dashboard.count.mockResolvedValue(1);
      const result = await service.findAll('t1', 1, 10);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return dashboard when found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: '1', tenantId: 't1' });
      const result = await service.findOne('t1', '1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);
      await expect(service.findOne('t1', 'bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('publish', () => {
    it('should publish a DRAFT dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: '1', status: 'DRAFT', tenantId: 't1' });
      prisma.dashboard.update.mockResolvedValue({ id: '1', status: 'PUBLISHED' });
      const result = await service.publish('t1', '1');
      expect(result.status).toBe('PUBLISHED');
    });

    it('should reject publishing a non-DRAFT dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: '1', status: 'PUBLISHED', tenantId: 't1' });
      await expect(service.publish('t1', '1')).rejects.toThrow(BadRequestException);
    });

    it('should reject publishing an ARCHIVED dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: '1', status: 'ARCHIVED', tenantId: 't1' });
      await expect(service.publish('t1', '1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('archive', () => {
    it('should archive a PUBLISHED dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: '1', status: 'PUBLISHED', tenantId: 't1' });
      prisma.dashboard.update.mockResolvedValue({ id: '1', status: 'ARCHIVED' });
      const result = await service.archive('t1', '1');
      expect(result.status).toBe('ARCHIVED');
    });

    it('should reject archiving a DRAFT dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: '1', status: 'DRAFT', tenantId: 't1' });
      await expect(service.archive('t1', '1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: '1', tenantId: 't1' });
      prisma.dashboard.delete.mockResolvedValue({ id: '1' });
      await service.remove('t1', '1');
      expect(prisma.dashboard.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw when dashboard not found for deletion', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);
      await expect(service.remove('t1', 'bad')).rejects.toThrow(NotFoundException);
    });
  });
});
