// Unit tests
import { Test } from '@nestjs/testing';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

describe('SessionController', () => {
  let controller: SessionController;
  let sessionService: Record<string, jest.Mock>;

  beforeEach(async () => {
    sessionService = {
      findAll: jest.fn().mockResolvedValue({ data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } }),
      findOne: jest.fn().mockResolvedValue({ id: '1' }),
      create: jest.fn().mockResolvedValue({ id: '1' }),
      update: jest.fn().mockResolvedValue({ id: '1' }),
      remove: jest.fn().mockResolvedValue(undefined),
      confirmSession: jest.fn().mockResolvedValue({ id: '1', status: 'CONFIRMED' }),
    };

    const module = await Test.createTestingModule({
      controllers: [SessionController],
      providers: [{ provide: SessionService, useValue: sessionService }],
    }).compile();

    controller = module.get<SessionController>(SessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call findAll', async () => {
    const req = { user: { userId: 'u1', tenantId: 't1', role: 'ADMIN', email: 'a@a.com' } } as never;
    await controller.findAll(req, {});
    expect(sessionService['findAll']).toHaveBeenCalledWith('t1', {});
  });
});
