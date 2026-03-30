import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeyController } from './api-key.controller';
import { ApiKeyService } from './api-key.service';

describe('ApiKeyController', () => {
  let controller: ApiKeyController;
  let service: { create: jest.Mock; findAll: jest.Mock; revoke: jest.Mock };
  const mockReq = { user: { userId: 'u1', tenantId: 't1', role: 'ADMIN' } };

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue({ id: 'ak1', key: 'ae_xxx' }),
      findAll: jest.fn().mockResolvedValue([]),
      revoke: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiKeyController],
      providers: [{ provide: ApiKeyService, useValue: service }],
    }).compile();

    controller = module.get<ApiKeyController>(ApiKeyController);
  });

  it('should create API key', async () => {
    await controller.create(mockReq as never, { name: 'Test' });
    expect(service.create).toHaveBeenCalledWith('t1', { name: 'Test' });
  });

  it('should find all API keys', async () => {
    await controller.findAll(mockReq as never);
    expect(service.findAll).toHaveBeenCalledWith('t1');
  });

  it('should revoke API key', async () => {
    await controller.revoke(mockReq as never, 'ak1');
    expect(service.revoke).toHaveBeenCalledWith('t1', 'ak1');
  });
});
