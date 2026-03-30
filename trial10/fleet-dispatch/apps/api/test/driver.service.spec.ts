import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DriverService } from '../src/driver/driver.service';
import { PrismaService } from '../src/common/prisma.service';
import { createMockPrismaModel } from './helpers/mock-prisma';

describe('DriverService', () => {
  let service: DriverService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  beforeEach(async () => {
    prisma = {
      driver: createMockPrismaModel(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [DriverService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<DriverService>(DriverService);
  });

  it('should create a driver with correct tenant scope', async () => {
    prisma['driver'].create.mockResolvedValue({ id: '1', firstName: 'John', lastName: 'Smith' });
    const result = await service.create('t1', {
      firstName: 'John',
      lastName: 'Smith',
      licenseNumber: 'DL-12345',
      phone: '+1-555-0100',
    });
    expect(result).toHaveProperty('id');
    expect(prisma['driver'].create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          firstName: 'John',
          lastName: 'Smith',
          tenantId: 't1',
        }),
      }),
    );
  });

  it('should throw NotFoundException when driver not found', async () => {
    prisma['driver'].findFirst.mockResolvedValue(null);
    await expect(service.findOne('t1', 'bad-id')).rejects.toThrow(NotFoundException);
    expect(prisma['driver'].findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'bad-id', tenantId: 't1' },
      }),
    );
  });

  it('should return paginated driver list', async () => {
    prisma['driver'].findMany.mockResolvedValue([{ id: '1' }]);
    prisma['driver'].count.mockResolvedValue(1);
    const result = await service.findAll('t1', 1, 10);
    expect(result).toHaveProperty('items');
    expect(result.total).toBe(1);
  });

  it('should update a driver phone number', async () => {
    prisma['driver'].findFirst.mockResolvedValue({ id: '1', tenantId: 't1' });
    prisma['driver'].update.mockResolvedValue({ id: '1', phone: '+1-555-9999' });
    const result = await service.update('t1', '1', { phone: '+1-555-9999' });
    expect(result.phone).toBe('+1-555-9999');
    expect(prisma['driver'].update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '1' } }),
    );
  });

  it('should soft-delete by setting status to OFF_DUTY', async () => {
    prisma['driver'].findFirst.mockResolvedValue({ id: '1', tenantId: 't1' });
    prisma['driver'].update.mockResolvedValue({ id: '1', status: 'OFF_DUTY' });
    const result = await service.remove('t1', '1');
    expect(result.status).toBe('OFF_DUTY');
    expect(prisma['driver'].update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'OFF_DUTY' } }),
    );
  });
});
