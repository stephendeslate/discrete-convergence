import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DriverService } from './driver.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  driver: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('DriverService', () => {
  let service: DriverService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DriverService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(DriverService);
    jest.clearAllMocks();
  });

  it('should find all drivers with tenant scoping', async () => {
    mockPrisma.driver.findMany.mockResolvedValue([{ id: '1', firstName: 'John' }]);
    mockPrisma.driver.count.mockResolvedValue(1);
    const result = await service.findAll('t1', 1, 10);
    expect(mockPrisma.driver.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 't1' } }),
    );
    expect(result.data).toHaveLength(1);
  });

  it('should find one driver by id', async () => {
    mockPrisma.driver.findUnique.mockResolvedValue({ id: '1', tenantId: 't1' });
    const result = await service.findOne('1', 't1');
    expect(mockPrisma.driver.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(result.id).toBe('1');
  });

  it('should throw NotFoundException if driver not found', async () => {
    mockPrisma.driver.findUnique.mockResolvedValue(null);
    await expect(service.findOne('bad', 't1')).rejects.toThrow(NotFoundException);
    expect(mockPrisma.driver.findUnique).toHaveBeenCalledWith({ where: { id: 'bad' } });
  });

  it('should throw NotFoundException for wrong tenant', async () => {
    mockPrisma.driver.findUnique.mockResolvedValue({ id: '1', tenantId: 'other' });
    await expect(service.findOne('1', 't1')).rejects.toThrow(NotFoundException);
    expect(mockPrisma.driver.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should create a driver', async () => {
    const dto = { firstName: 'Jane', lastName: 'Doe', email: 'jane@test.com', licenseNumber: 'L123', phone: '555-0100' };
    mockPrisma.driver.create.mockResolvedValue({ id: '2', ...dto, tenantId: 't1' });
    const result = await service.create(dto, 't1');
    expect(mockPrisma.driver.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ tenantId: 't1' }) }),
    );
    expect(result.firstName).toBe('Jane');
  });

  it('should update a driver', async () => {
    mockPrisma.driver.findUnique.mockResolvedValue({ id: '1', tenantId: 't1' });
    mockPrisma.driver.update.mockResolvedValue({ id: '1', firstName: 'Updated' });
    const result = await service.update('1', { firstName: 'Updated' }, 't1');
    expect(mockPrisma.driver.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '1' } }),
    );
    expect(result.firstName).toBe('Updated');
  });

  it('should delete a driver', async () => {
    mockPrisma.driver.findUnique.mockResolvedValue({ id: '1', tenantId: 't1' });
    mockPrisma.driver.delete.mockResolvedValue({ id: '1' });
    await service.remove('1', 't1');
    expect(mockPrisma.driver.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });
});
