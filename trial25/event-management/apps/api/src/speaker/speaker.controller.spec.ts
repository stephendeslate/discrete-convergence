// Unit tests
import { Test } from '@nestjs/testing';
import { SpeakerController } from './speaker.controller';
import { SpeakerService } from './speaker.service';

describe('SpeakerController', () => {
  let controller: SpeakerController;
  let speakerService: Record<string, jest.Mock>;

  beforeEach(async () => {
    speakerService = {
      findAll: jest.fn().mockResolvedValue({ data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } }),
      findOne: jest.fn().mockResolvedValue({ id: '1' }),
      create: jest.fn().mockResolvedValue({ id: '1' }),
      update: jest.fn().mockResolvedValue({ id: '1' }),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const module = await Test.createTestingModule({
      controllers: [SpeakerController],
      providers: [{ provide: SpeakerService, useValue: speakerService }],
    }).compile();

    controller = module.get<SpeakerController>(SpeakerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call findAll', async () => {
    const req = { user: { userId: 'u1', tenantId: 't1', role: 'ADMIN', email: 'a@a.com' } } as never;
    await controller.findAll(req, {});
    expect(speakerService['findAll']).toHaveBeenCalledWith('t1', {});
  });
});
