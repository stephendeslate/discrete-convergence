import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from '../src/dashboard/dashboard.service';
import { PrismaService } from '../src/infra/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockPrisma = {
  dashboard: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $executeRaw: jest.fn(),
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  describe('create', () => {
    it('should create a dashboard', async () => {
      const expected = { id: '1', title: 'Test', tenantId: 't1', widgets: [] };
      mockPrisma.dashboard.create.mockResolvedValue(expected);

      const result = await service.create('t1', 'Test');
      expect(result).toEqual(expected);
      expect(mockPrisma.dashboard.create).toHaveBeenCalledWith({
        data: { title: 'Test', description: undefined, tenantId: 't1' },
        include: { widgets: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return a dashboard', async () => {
      const expected = { id: '1', tenantId: 't1', widgets: [], embedConfig: null };
      mockPrisma.dashboard.findUnique.mockResolvedValue(expected);

      const result = await service.findOne('1', 't1');
      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue(null);
      await expect(service.findOne('1', 't1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if tenant mismatch', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue({ id: '1', tenantId: 'other' });
      await expect(service.findOne('1', 't1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('publish', () => {
    it('should publish a DRAFT dashboard', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue({
        id: '1', tenantId: 't1', status: 'DRAFT',
      });
      mockPrisma.dashboard.update.mockResolvedValue({
        id: '1', tenantId: 't1', status: 'PUBLISHED', widgets: [],
      });

      const result = await service.publish('1', 't1');
      expect(result.status).toBe('PUBLISHED');
    });

    it('should reject publishing non-DRAFT dashboard', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue({
        id: '1', tenantId: 't1', status: 'PUBLISHED',
      });
      await expect(service.publish('1', 't1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('archive', () => {
    it('should reject archiving non-PUBLISHED dashboard', async () => {
      mockPrisma.dashboard.findUnique.mockResolvedValue({
        id: '1', tenantId: 't1', status: 'DRAFT',
      });
      await expect(service.archive('1', 't1')).rejects.toThrow(BadRequestException);
    });
  });
});
