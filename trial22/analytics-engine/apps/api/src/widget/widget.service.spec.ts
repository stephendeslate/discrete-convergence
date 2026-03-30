import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WidgetService } from './widget.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  widget: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('WidgetService', () => {
  let service: WidgetService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        WidgetService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(WidgetService);
    jest.clearAllMocks();
  });

  it('should find all widgets with tenant scoping', async () => {
    mockPrisma.widget.findMany.mockResolvedValue([{ id: '1' }]);
    mockPrisma.widget.count.mockResolvedValue(1);

    const result = await service.findAll('tenant-1', 1, 10);

    expect(mockPrisma.widget.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
    );
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should find one widget by id', async () => {
    mockPrisma.widget.findUnique.mockResolvedValue({ id: '1', tenantId: 'tenant-1' });

    const result = await service.findOne('1', 'tenant-1');

    expect(mockPrisma.widget.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '1' } }),
    );
    expect(result.id).toBe('1');
  });

  it('should throw NotFoundException when widget not found', async () => {
    mockPrisma.widget.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing', 'tenant-1')).rejects.toThrow(NotFoundException);
    expect(mockPrisma.widget.findUnique).toHaveBeenCalled();
  });

  it('should create a widget', async () => {
    const dto = { title: 'Widget', type: 'LINE_CHART', config: '{}', dashboardId: 'd1', dataSourceId: 'ds1' };
    mockPrisma.widget.create.mockResolvedValue({ id: '1', ...dto, tenantId: 'tenant-1' });

    const result = await service.create(dto, 'tenant-1');

    expect(mockPrisma.widget.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ title: 'Widget', tenantId: 'tenant-1' }),
    });
    expect(result.title).toBe('Widget');
  });

  it('should update a widget', async () => {
    mockPrisma.widget.findUnique.mockResolvedValue({ id: '1', tenantId: 'tenant-1' });
    mockPrisma.widget.update.mockResolvedValue({ id: '1', title: 'Updated' });

    const result = await service.update('1', { title: 'Updated' }, 'tenant-1');

    expect(mockPrisma.widget.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '1' } }),
    );
    expect(result.title).toBe('Updated');
  });

  it('should delete a widget', async () => {
    mockPrisma.widget.findUnique.mockResolvedValue({ id: '1', tenantId: 'tenant-1' });
    mockPrisma.widget.delete.mockResolvedValue({ id: '1' });

    const result = await service.remove('1', 'tenant-1');

    expect(mockPrisma.widget.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(result.id).toBe('1');
  });
});
