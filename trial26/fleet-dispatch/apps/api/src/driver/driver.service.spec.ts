import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DriverService } from './driver.service';
import { PrismaService } from '../infra/prisma.service';

describe('DriverService', () => {
  let service: DriverService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      driver: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      dispatch: { count: jest.fn().mockResolvedValue(0) },
      auditLog: { create: jest.fn() },
      setTenantContext: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriverService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DriverService>(DriverService);
  });

  describe('findAll', () => {
    it('should return paginated drivers', async () => {
      const mockData = [{ id: 'dr1', name: 'John', tenantId: 't1' }];
      prisma.driver.findMany.mockResolvedValue(mockData);
      prisma.driver.count.mockResolvedValue(1);

      const result = await service.findAll('t1', { page: 1, pageSize: 10 });

      expect(prisma.setTenantContext).toHaveBeenCalledWith('t1');
      expect(result.data).toEqual(mockData);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return driver when found', async () => {
      const mockDriver = { id: 'dr1', name: 'John', tenantId: 't1' };
      prisma.driver.findFirst.mockResolvedValue(mockDriver);

      const result = await service.findOne('dr1', 't1');

      expect(prisma.setTenantContext).toHaveBeenCalledWith('t1');
      expect(result).toEqual(mockDriver);
    });

    it('should throw NotFoundException', async () => {
      prisma.driver.findFirst.mockResolvedValue(null);
      await expect(service.findOne('x', 't1')).rejects.toThrow(NotFoundException);
      expect(prisma.setTenantContext).toHaveBeenCalledWith('t1');
    });
  });

  describe('create', () => {
    it('should create a driver', async () => {
      const dto = { name: 'John', email: 'john@test.com', phone: '555-1234', licenseNumber: 'DL-001' };
      prisma.driver.create.mockResolvedValue({ id: 'dr1', ...dto, tenantId: 't1' });

      const result = await service.create(dto, 't1', 'u1');

      expect(prisma.setTenantContext).toHaveBeenCalledWith('t1');
      expect(prisma.driver.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ name: 'John', tenantId: 't1' }),
        }),
      );
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result.id).toBe('dr1');
    });
  });

  describe('update', () => {
    it('should update a driver', async () => {
      prisma.driver.findFirst.mockResolvedValue({ id: 'dr1', name: 'John', tenantId: 't1' });
      prisma.driver.update.mockResolvedValue({ id: 'dr1', name: 'Jane', tenantId: 't1' });

      const result = await service.update('dr1', { name: 'Jane' }, 't1', 'u1');

      expect(prisma.driver.update).toHaveBeenCalledWith({ where: { id: 'dr1' }, data: { name: 'Jane' } });
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result.name).toBe('Jane');
    });

    it('should throw if driver not found', async () => {
      prisma.driver.findFirst.mockResolvedValue(null);
      await expect(service.update('x', { name: 'Y' }, 't1', 'u1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a driver', async () => {
      prisma.driver.findFirst.mockResolvedValue({ id: 'dr1', status: 'AVAILABLE', tenantId: 't1' });
      prisma.dispatch.count.mockResolvedValue(0);

      const result = await service.remove('dr1', 't1', 'u1');

      expect(prisma.driver.delete).toHaveBeenCalledWith({ where: { id: 'dr1' } });
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result.deleted).toBe(true);
    });

    it('should reject deletion of ON_DUTY driver', async () => {
      prisma.driver.findFirst.mockResolvedValue({ id: 'dr1', status: 'ON_DUTY', tenantId: 't1' });

      await expect(service.remove('dr1', 't1', 'u1')).rejects.toThrow(BadRequestException);
      expect(prisma.driver.delete).not.toHaveBeenCalled();
    });

    it('should reject deletion with active dispatches', async () => {
      prisma.driver.findFirst.mockResolvedValue({ id: 'dr1', status: 'AVAILABLE', tenantId: 't1' });
      prisma.dispatch.count.mockResolvedValue(1);

      await expect(service.remove('dr1', 't1', 'u1')).rejects.toThrow(BadRequestException);
      expect(prisma.driver.delete).not.toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should update driver status', async () => {
      prisma.driver.findFirst.mockResolvedValue({ id: 'dr1', status: 'AVAILABLE', tenantId: 't1' });
      prisma.driver.update.mockResolvedValue({ id: 'dr1', status: 'ON_DUTY' });

      const result = await service.updateStatus('dr1', 'ON_DUTY', 't1', 'u1');

      expect(prisma.driver.update).toHaveBeenCalledWith({
        where: { id: 'dr1' },
        data: { status: 'ON_DUTY' },
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
      expect(result.status).toBe('ON_DUTY');
    });

    it('should throw if same status', async () => {
      prisma.driver.findFirst.mockResolvedValue({ id: '1', status: 'AVAILABLE', tenantId: 't1' });
      await expect(service.updateStatus('1', 'AVAILABLE', 't1', 'u1')).rejects.toThrow(BadRequestException);
      expect(prisma.driver.update).not.toHaveBeenCalled();
    });

    it('should throw if OFF_DUTY to ON_DUTY', async () => {
      prisma.driver.findFirst.mockResolvedValue({ id: '1', status: 'OFF_DUTY', tenantId: 't1' });
      await expect(service.updateStatus('1', 'ON_DUTY', 't1', 'u1')).rejects.toThrow(BadRequestException);
      expect(prisma.driver.update).not.toHaveBeenCalled();
    });
  });
});
