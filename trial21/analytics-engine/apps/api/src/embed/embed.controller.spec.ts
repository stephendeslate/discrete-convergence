import { Test, TestingModule } from '@nestjs/testing';
import { EmbedController } from './embed.controller';
import { EmbedService } from './embed.service';

describe('EmbedController', () => {
  let controller: EmbedController;
  let service: { getConfig: jest.Mock; upsertConfig: jest.Mock };
  const mockReq = { user: { userId: 'u1', tenantId: 't1', role: 'USER' } };

  beforeEach(async () => {
    service = {
      getConfig: jest.fn().mockResolvedValue({ allowedOrigins: ['*'] }),
      upsertConfig: jest.fn().mockResolvedValue({ dashboardId: 'd1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmbedController],
      providers: [{ provide: EmbedService, useValue: service }],
    }).compile();

    controller = module.get<EmbedController>(EmbedController);
  });

  it('should get embed config', async () => {
    await controller.getConfig('d1');
    expect(service.getConfig).toHaveBeenCalledWith('d1');
  });

  it('should upsert embed config', async () => {
    await controller.upsertConfig(mockReq as never, 'd1', { allowedOrigins: ['*'] });
    expect(service.upsertConfig).toHaveBeenCalledWith('t1', 'd1', ['*'], {});
  });

  it('should return SSE observable', () => {
    const obs = controller.stream('d1');
    expect(obs).toBeDefined();
    expect(obs.subscribe).toBeDefined();
  });
});
