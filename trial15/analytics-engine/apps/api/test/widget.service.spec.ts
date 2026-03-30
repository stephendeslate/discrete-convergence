import { Test, TestingModule } from '@nestjs/testing';
import { WidgetService } from '../src/widget/widget.service';
import { PrismaService } from '../src/infra/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  widget: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('WidgetService', () => {
  let service: WidgetService;

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

  it('should create a widget with tenant isolation', async () => {
    const mockWidget = { id: '1', title: 'W1', type: 'BAR_CHART', tenantId: 't1' };
    mockPrisma.widget.create.mockResolvedValue(mockWidget);

    const result = await service.create(
      { title: 'W1', type: 'BAR_CHART', dashboardId: 'd1' },
      't1',
    );
    expect(result).toEqual(mockWidget);
    expect(mockPrisma.widget.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ title: 'W1', tenantId: 't1' }),
      }),
    );
  });

  it('should find all widgets for a tenant', async () => {
    const mockWidgets = [{ id: '1', title: 'W1', tenantId: 't1' }];
    mockPrisma.widget.findMany.mockResolvedValue(mockWidgets);
    mockPrisma.widget.count.mockResolvedValue(1);

    const result = await service.findAll('t1', {});
    expect(result.data).toEqual(mockWidgets);
    expect(result.total).toBe(1);
    expect(mockPrisma.widget.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 't1' },
      }),
    );
  });

  it('should throw NotFoundException for non-existent widget', async () => {
    mockPrisma.widget.findFirst.mockResolvedValue(null);

    await expect(service.findOne('bad-id', 't1')).rejects.toThrow(NotFoundException);
    expect(mockPrisma.widget.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'bad-id', tenantId: 't1' } }),
    );
  });

  it('should update a widget', async () => {
    const existing = { id: '1', title: 'Old', tenantId: 't1' };
    const updated = { id: '1', title: 'New', tenantId: 't1' };
    mockPrisma.widget.findFirst.mockResolvedValue(existing);
    mockPrisma.widget.update.mockResolvedValue(updated);

    const result = await service.update('1', { title: 'New' }, 't1');
    expect(result.title).toBe('New');
    expect(mockPrisma.widget.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '1' },
        data: expect.objectContaining({ title: 'New' }),
      }),
    );
  });

  it('should delete a widget', async () => {
    const existing = { id: '1', title: 'W1', tenantId: 't1' };
    mockPrisma.widget.findFirst.mockResolvedValue(existing);
    mockPrisma.widget.delete.mockResolvedValue(existing);

    await service.remove('1', 't1');
    expect(mockPrisma.widget.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });
});
