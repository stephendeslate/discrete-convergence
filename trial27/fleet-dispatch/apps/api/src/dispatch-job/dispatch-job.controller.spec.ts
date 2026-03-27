// TRACED: FD-API-004 — Dispatch job controller unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { DispatchJobController } from './dispatch-job.controller';
import { DispatchJobService } from './dispatch-job.service';
import { CreateDispatchJobDto } from './dto/create-dispatch-job.dto';
import { UpdateDispatchJobDto } from './dto/update-dispatch-job.dto';
import { AssignJobDto } from './dto/assign-job.dto';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  assign: jest.fn(),
  complete: jest.fn(),
  cancel: jest.fn(),
};

describe('DispatchJobController', () => {
  let controller: DispatchJobController;
  const tenantId = 'tenant-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DispatchJobController],
      providers: [{ provide: DispatchJobService, useValue: mockService }],
    }).compile();

    controller = module.get<DispatchJobController>(DispatchJobController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate to service.create', async () => {
      const dto = { origin: 'A', destination: 'B' };
      mockService.create.mockResolvedValue({ id: 'j1', ...dto });

      const result = await controller.create(tenantId, dto as unknown as CreateDispatchJobDto);

      expect(mockService.create).toHaveBeenCalledWith(tenantId, dto);
      expect(result.id).toBe('j1');
    });
  });

  describe('findAll', () => {
    it('should delegate to service.findAll with pagination', async () => {
      mockService.findAll.mockResolvedValue({ data: [], meta: {} });

      await controller.findAll(tenantId, { page: 1, pageSize: 10 });

      expect(mockService.findAll).toHaveBeenCalledWith(tenantId, 1, 10);
    });
  });

  describe('findOne', () => {
    it('should delegate to service.findOne', async () => {
      mockService.findOne.mockResolvedValue({ id: 'j1' });

      const result = await controller.findOne(tenantId, 'j1');

      expect(result.id).toBe('j1');
    });

    it('should propagate not found error', async () => {
      mockService.findOne.mockRejectedValue(new Error('Not Found'));

      await expect(controller.findOne(tenantId, 'bad')).rejects.toThrow('Not Found');
    });
  });

  describe('update', () => {
    it('should delegate to service.update', async () => {
      mockService.update.mockResolvedValue({ id: 'j1', origin: 'X' });

      const result = await controller.update(tenantId, 'j1', { origin: 'X' } as unknown as UpdateDispatchJobDto);

      expect(result.origin).toBe('X');
    });
  });

  describe('remove', () => {
    it('should delegate to service.remove', async () => {
      mockService.remove.mockResolvedValue({ id: 'j1' });

      await controller.remove(tenantId, 'j1');

      expect(mockService.remove).toHaveBeenCalledWith(tenantId, 'j1');
    });
  });

  describe('assign', () => {
    it('should delegate to service.assign', async () => {
      const dto = { vehicleId: 'v1', driverId: 'd1' };
      mockService.assign.mockResolvedValue({ id: 'j1', status: 'IN_PROGRESS' });

      const result = await controller.assign(tenantId, 'j1', dto as unknown as AssignJobDto);

      expect(result.status).toBe('IN_PROGRESS');
    });
  });

  describe('complete', () => {
    it('should delegate to service.complete', async () => {
      mockService.complete.mockResolvedValue({ id: 'j1', status: 'COMPLETED' });

      const result = await controller.complete(tenantId, 'j1');

      expect(result.status).toBe('COMPLETED');
    });
  });

  describe('cancel', () => {
    it('should delegate to service.cancel', async () => {
      mockService.cancel.mockResolvedValue({ id: 'j1', status: 'CANCELLED' });

      const result = await controller.cancel(tenantId, 'j1');

      expect(result.status).toBe('CANCELLED');
    });
  });
});
