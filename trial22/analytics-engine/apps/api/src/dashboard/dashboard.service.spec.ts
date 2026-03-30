import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  dashboard: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(DashboardService);
    jest.clearAllMocks();
  });

  it('should find all dashboards with tenant scoping', async () => {
    mockPrisma.dashboard.findMany.mockResolvedValue([{ id: '1', title: 'Test' }]);
    mockPrisma.dashboard.count.mockResolvedValue(1);

    const result = await service.findAll('tenant-1', 1, 10);

    expect(mockPrisma.dashboard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
    );
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should find one dashboard by id', async () => {
    mockPrisma.dashboard.findUnique.mockResolvedValue({ id: '1', tenantId: 'tenant-1' });

    const result = await service.findOne('1', 'tenant-1');

    expect(mockPrisma.dashboard.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '1' } }),
    );
    expect(result.id).toBe('1');
  });

  it('should throw NotFoundException when dashboard not found', async () => {
    mockPrisma.dashboard.findUnique.mockResolvedValue(null);

    await expect(service.findOne('nonexistent', 'tenant-1')).rejects.toThrow(NotFoundException);
    expect(mockPrisma.dashboard.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'nonexistent' } }),
    );
  });

  it('should throw NotFoundException for wrong tenant', async () => {
    mockPrisma.dashboard.findUnique.mockResolvedValue({ id: '1', tenantId: 'other-tenant' });

    await expect(service.findOne('1', 'tenant-1')).rejects.toThrow(NotFoundException);
    expect(mockPrisma.dashboard.findUnique).toHaveBeenCalled();
  });

  it('should create a dashboard', async () => {
    const dto = { title: 'New Dashboard' };
    mockPrisma.dashboard.create.mockResolvedValue({ id: '1', title: 'New Dashboard', tenantId: 'tenant-1' });

    const result = await service.create(dto, 'tenant-1', 'user-1');

    expect(mockPrisma.dashboard.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ title: 'New Dashboard', tenantId: 'tenant-1', userId: 'user-1' }),
    });
    expect(result.title).toBe('New Dashboard');
  });

  it('should update a dashboard', async () => {
    mockPrisma.dashboard.findUnique.mockResolvedValue({ id: '1', tenantId: 'tenant-1' });
    mockPrisma.dashboard.update.mockResolvedValue({ id: '1', title: 'Updated' });

    const result = await service.update('1', { title: 'Updated' }, 'tenant-1');

    expect(mockPrisma.dashboard.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '1' } }),
    );
    expect(result.title).toBe('Updated');
  });

  it('should delete a dashboard', async () => {
    mockPrisma.dashboard.findUnique.mockResolvedValue({ id: '1', tenantId: 'tenant-1' });
    mockPrisma.dashboard.delete.mockResolvedValue({ id: '1' });

    const result = await service.remove('1', 'tenant-1');

    expect(mockPrisma.dashboard.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(result.id).toBe('1');
  });
});
