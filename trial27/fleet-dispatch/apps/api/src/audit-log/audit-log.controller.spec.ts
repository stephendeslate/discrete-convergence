// TRACED: FD-API-009 — Audit log controller unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogController } from './audit-log.controller';
import { AuditLogService } from './audit-log.service';

const mockService = {
  findAll: jest.fn(),
};

describe('AuditLogController', () => {
  let controller: AuditLogController;
  const tenantId = 'tenant-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogController],
      providers: [{ provide: AuditLogService, useValue: mockService }],
    }).compile();

    controller = module.get<AuditLogController>(AuditLogController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to service.findAll', async () => {
      mockService.findAll.mockResolvedValue({ data: [], meta: {} });

      await controller.findAll(tenantId, { page: 1, pageSize: 10 });

      expect(mockService.findAll).toHaveBeenCalledWith(tenantId, 1, 10);
    });
  });
});
