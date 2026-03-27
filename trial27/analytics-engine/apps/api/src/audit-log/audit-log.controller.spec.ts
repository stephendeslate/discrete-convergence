import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { AuditLogController } from './audit-log.controller';
import { AuditLogService } from './audit-log.service';

describe('AuditLogController', () => {
  let controller: AuditLogController;
  let service: { findAll: jest.Mock };

  beforeEach(async () => {
    service = { findAll: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogController],
      providers: [{ provide: AuditLogService, useValue: service }],
    }).compile();

    controller = module.get<AuditLogController>(AuditLogController);
  });

  it('should call findAll with tenantId and pagination', async () => {
    const mockReq = { user: { tenantId: 'tenant-1' } } as unknown as Request;
    service.findAll.mockResolvedValue({ data: [], meta: { total: 0 } });

    await controller.findAll(mockReq, { page: 1, pageSize: 20 });

    expect(service.findAll).toHaveBeenCalledWith('tenant-1', 1, 20);
  });

  it('should return paginated audit logs', async () => {
    const mockReq = { user: { tenantId: 'tenant-1' } } as unknown as Request;
    const expected = { data: [{ id: 'log-1' }], meta: { total: 1, page: 1, pageSize: 20, totalPages: 1 } };
    service.findAll.mockResolvedValue(expected);

    const result = await controller.findAll(mockReq, {});

    expect(result).toEqual(expected);
  });
});
