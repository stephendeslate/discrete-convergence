import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WidgetService } from '../src/widget/widget.service';
import { PrismaService } from '../src/prisma.service';

describe('WidgetService', () => {
  let service: WidgetService;
  const mockPrisma = {
    widget: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const tenantId = 'tenant-1';
  const mockWidget = {
    id: 'w-1',
    name: 'Chart',
    type: 'BAR_CHART',
    config: '{}',
    dashboardId: 'dash-1',
    dataSourceId: null,
    positionX: 0,
    positionY: 0,
    width: 4,
    height: 3,
    tenantId,
    createdAt: new Date(),
    updatedAt: new Date(),
    dashboard: {},
    dataSource: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WidgetService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<WidgetService>(WidgetService);
    jest.clearAllMocks();
  });

  it('should create a widget', async () => {
    mockPrisma.widget.create.mockResolvedValue(mockWidget);

    const result = await service.create(
      { name: 'Chart', type: 'BAR_CHART', dashboardId: 'dash-1' },
      tenantId,
    );
    expect(result).toEqual(mockWidget);
    expect(mockPrisma.widget.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: 'Chart', tenantId }),
      }),
    );
  });

  it('should find all widgets', async () => {
    mockPrisma.widget.findMany.mockResolvedValue([mockWidget]);
    mockPrisma.widget.count.mockResolvedValue(1);

    const result = await service.findAll(tenantId);
    expect(result.items).toEqual([mockWidget]);
    expect(mockPrisma.widget.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId },
      }),
    );
  });

  it('should find one widget', async () => {
    mockPrisma.widget.findUnique.mockResolvedValue(mockWidget);

    const result = await service.findOne('w-1', tenantId);
    expect(result).toEqual(mockWidget);
    expect(mockPrisma.widget.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'w-1' } }),
    );
  });

  it('should throw NotFoundException for missing widget', async () => {
    mockPrisma.widget.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing', tenantId)).rejects.toThrow(NotFoundException);
    expect(mockPrisma.widget.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'missing' } }),
    );
  });

  it('should update a widget', async () => {
    mockPrisma.widget.findUnique.mockResolvedValue(mockWidget);
    mockPrisma.widget.update.mockResolvedValue({ ...mockWidget, name: 'Updated' });

    const result = await service.update('w-1', { name: 'Updated' }, tenantId);
    expect(result.name).toBe('Updated');
    expect(mockPrisma.widget.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'w-1' } }),
    );
  });

  it('should delete a widget', async () => {
    mockPrisma.widget.findUnique.mockResolvedValue(mockWidget);
    mockPrisma.widget.delete.mockResolvedValue(mockWidget);

    await service.remove('w-1', tenantId);
    expect(mockPrisma.widget.delete).toHaveBeenCalledWith({ where: { id: 'w-1' } });
  });
});
