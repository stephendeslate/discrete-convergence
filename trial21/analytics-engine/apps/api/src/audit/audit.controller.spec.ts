import { Test, TestingModule } from '@nestjs/testing';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

describe('AuditController', () => {
  let controller: AuditController;
  let service: { findAll: jest.Mock };
  const mockReq = { user: { userId: 'u1', tenantId: 't1', role: 'ADMIN' } };

  beforeEach(async () => {
    service = { findAll: jest.fn().mockResolvedValue({ data: [], total: 0 }) };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [{ provide: AuditService, useValue: service }],
    }).compile();

    controller = module.get<AuditController>(AuditController);
  });

  it('should find all audit logs', async () => {
    await controller.findAll(mockReq as never, { page: 1, limit: 20 });
    expect(service.findAll).toHaveBeenCalledWith('t1', 1, 20);
  });
});
