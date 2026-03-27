// TRACED: FD-API-003 — Driver controller unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('DriverController', () => {
  let controller: DriverController;
  const tenantId = 'tenant-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DriverController],
      providers: [{ provide: DriverService, useValue: mockService }],
    }).compile();

    controller = module.get<DriverController>(DriverController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate to service.create', async () => {
      const dto = { name: 'John', email: 'j@e.com', licenseNumber: 'DL-1' };
      mockService.create.mockResolvedValue({ id: 'd1', ...dto });

      const result = await controller.create(tenantId, dto as unknown as CreateDriverDto);

      expect(result.name).toBe('John');
    });
  });

  describe('findAll', () => {
    it('should delegate to service.findAll', async () => {
      mockService.findAll.mockResolvedValue({ data: [{ id: 'd1' }], meta: {} });

      const result = await controller.findAll(tenantId, { page: 1, pageSize: 10 });

      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should delegate to service.findOne', async () => {
      mockService.findOne.mockResolvedValue({ id: 'd1' });

      const result = await controller.findOne(tenantId, 'd1');

      expect(result.id).toBe('d1');
    });
  });

  describe('update', () => {
    it('should delegate to service.update', async () => {
      mockService.update.mockResolvedValue({ id: 'd1', name: 'Updated' });

      const result = await controller.update(tenantId, 'd1', { name: 'Updated' } as unknown as UpdateDriverDto);

      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delegate to service.remove', async () => {
      mockService.remove.mockResolvedValue({ id: 'd1' });

      await controller.remove(tenantId, 'd1');

      expect(mockService.remove).toHaveBeenCalledWith(tenantId, 'd1');
    });
  });
});
