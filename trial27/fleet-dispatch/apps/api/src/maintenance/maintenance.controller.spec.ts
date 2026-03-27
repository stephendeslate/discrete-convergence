// TRACED: FD-API-008 — Maintenance controller unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';

const mockService = {
  findAll: jest.fn(),
  create: jest.fn(),
};

describe('MaintenanceController', () => {
  let controller: MaintenanceController;
  const tenantId = 'tenant-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaintenanceController],
      providers: [{ provide: MaintenanceService, useValue: mockService }],
    }).compile();

    controller = module.get<MaintenanceController>(MaintenanceController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to service.findAll', async () => {
      mockService.findAll.mockResolvedValue({ data: [], meta: {} });

      await controller.findAll(tenantId, 'v1', { page: 1, pageSize: 10 });

      expect(mockService.findAll).toHaveBeenCalledWith(tenantId, 'v1', 1, 10);
    });
  });

  describe('create', () => {
    it('should delegate to service.create', async () => {
      const dto = { type: 'OIL_CHANGE', description: 'Regular oil change' };
      mockService.create.mockResolvedValue({ id: 'm1', ...dto });

      const result = await controller.create(tenantId, 'v1', dto as unknown as CreateMaintenanceDto);

      expect(result.type).toBe('OIL_CHANGE');
      expect(mockService.create).toHaveBeenCalledWith(tenantId, 'v1', dto);
    });
  });
});
