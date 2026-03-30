import { Test } from '@nestjs/testing';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

describe('AuditController', () => {
  let controller: AuditController;
  let service: { findAll: jest.Mock };

  beforeEach(async () => {
    service = { findAll: jest.fn() };
    const module = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [{ provide: AuditService, useValue: service }],
    }).compile();
    controller = module.get(AuditController);
  });

  it('should be defined', () => { expect(controller).toBeDefined(); });

  it('findAll passes tenantId', async () => {
    service.findAll.mockResolvedValue({ data: [], total: 0 });
    await controller.findAll({ user: { tenantId: 't1' } } as any, { page: 1, limit: 20 });
    expect(service.findAll).toHaveBeenCalledWith('t1', 1, 20);
  });
});
