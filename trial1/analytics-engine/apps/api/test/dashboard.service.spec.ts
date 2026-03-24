import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from '../src/dashboard/dashboard.service';
import { PrismaService } from '../src/common/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  beforeEach(async () => {
    prisma = {
      dashboard: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        update: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      $executeRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should create a dashboard', async () => {
    prisma['dashboard'].create.mockResolvedValue({ id: '1', title: 'Test' });
    const result = await service.create('t1', { title: 'Test' });
    expect(result).toHaveProperty('id');
  });

  it('should throw NotFoundException when dashboard not found', async () => {
    prisma['dashboard'].findFirst.mockResolvedValue(null);
    await expect(service.findOne('t1', 'bad-id')).rejects.toThrow(NotFoundException);
  });

  it('should return paginated results', async () => {
    const result = await service.findAll('t1', 1, 10);
    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('total');
  });
});
