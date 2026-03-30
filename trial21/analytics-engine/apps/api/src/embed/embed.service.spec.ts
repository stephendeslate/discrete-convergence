import { Test, TestingModule } from '@nestjs/testing';
import { EmbedService } from './embed.service';
import { PrismaService } from '../infra/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('EmbedService', () => {
  let service: EmbedService;
  let prisma: {
    dashboard: { findFirst: jest.Mock };
    embedConfig: { upsert: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      dashboard: { findFirst: jest.fn() },
      embedConfig: { upsert: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmbedService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EmbedService>(EmbedService);
  });

  describe('getConfig', () => {
    it('should return embed config for published dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({
        id: 'd1', status: 'PUBLISHED', embedConfig: { allowedOrigins: ['*'] },
      });
      const result = await service.getConfig('d1');
      expect(result).toEqual({ allowedOrigins: ['*'] });
    });

    it('should throw when dashboard not found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);
      await expect(service.getConfig('bad')).rejects.toThrow(NotFoundException);
    });

    it('should throw when dashboard is not PUBLISHED', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'd1', status: 'DRAFT' });
      await expect(service.getConfig('d1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('upsertConfig', () => {
    it('should upsert embed config', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'd1', status: 'PUBLISHED' });
      prisma.embedConfig.upsert.mockResolvedValue({ dashboardId: 'd1' });
      const result = await service.upsertConfig('t1', 'd1', ['*'], {});
      expect(result.dashboardId).toBe('d1');
    });

    it('should reject embed for non-PUBLISHED dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'd1', status: 'DRAFT' });
      await expect(service.upsertConfig('t1', 'd1', ['*'], {}))
        .rejects.toThrow(BadRequestException);
    });
  });
});
