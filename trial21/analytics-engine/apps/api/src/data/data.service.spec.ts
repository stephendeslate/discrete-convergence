import { Test, TestingModule } from '@nestjs/testing';
import { DataService } from './data.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('DataService', () => {
  let service: DataService;
  let prisma: {
    dataSource: { findFirst: jest.Mock };
    dataPoint: { findMany: jest.Mock };
    dashboard: { findFirst: jest.Mock };
    widget: { findFirst: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      dataSource: { findFirst: jest.fn() },
      dataPoint: { findMany: jest.fn() },
      dashboard: { findFirst: jest.fn() },
      widget: { findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DataService>(DataService);
  });

  describe('preview', () => {
    it('should return data points for valid data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds1' });
      prisma.dataPoint.findMany.mockResolvedValue([{ id: 'dp1', value: 100 }]);

      const result = await service.preview('t1', 'ds1');
      expect(result).toHaveLength(1);
    });

    it('should throw when data source not found', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);
      await expect(service.preview('t1', 'bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getWidgetData', () => {
    it('should return empty array when widget has no data source', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'd1' });
      prisma.widget.findFirst.mockResolvedValue({ id: 'w1', dashboardId: 'd1', dataSourceId: null });

      const result = await service.getWidgetData('t1', 'd1', 'w1');
      expect(result).toEqual([]);
    });

    it('should throw when dashboard not found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);
      await expect(service.getWidgetData('t1', 'bad', 'w1')).rejects.toThrow(NotFoundException);
    });

    it('should throw when widget not found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'd1' });
      prisma.widget.findFirst.mockResolvedValue(null);
      await expect(service.getWidgetData('t1', 'd1', 'bad')).rejects.toThrow(NotFoundException);
    });
  });
});
