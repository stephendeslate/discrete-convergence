import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { AuditLogController } from './audit-log.controller';
import { AuditLogService } from './audit-log.service';

describe('AuditLogController', () => {
  let controller: AuditLogController;
  let service: { findAll: jest.Mock };

  const mockReq = { user: { userId: 'u1', email: 'admin@test.com', tenantId: 'tenant-1', role: 'ADMIN' } } as unknown as Request;

  beforeEach(async () => {
    service = { findAll: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogController],
      providers: [{ provide: AuditLogService, useValue: service }],
    }).compile();

    controller = module.get<AuditLogController>(AuditLogController);
  });

  it('should call findAll with tenantId and pagination', async () => {
    service.findAll.mockResolvedValue({ data: [], meta: { total: 0 } });

    await controller.findAll(mockReq, '1', '20');

    expect(service.findAll).toHaveBeenCalledWith('tenant-1', '1', '20');
  });

  it('should return empty data for tenant with no audit logs', async () => {
    service.findAll.mockResolvedValue({ data: [], meta: { total: 0, page: 1, pageSize: 20, totalPages: 0 } });

    const result = await controller.findAll(mockReq);

    expect(result.data).toHaveLength(0);
  });
});
