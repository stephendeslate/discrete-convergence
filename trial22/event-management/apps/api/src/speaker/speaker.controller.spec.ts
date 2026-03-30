import { Test, TestingModule } from '@nestjs/testing';
import { SpeakerController } from './speaker.controller';
import { SpeakerService } from './speaker.service';

const mockService = { findAll: jest.fn(), findOne: jest.fn(), create: jest.fn(), update: jest.fn(), remove: jest.fn() };
const mockReq = { user: { userId: 'u1', email: 'a@b.com', tenantId: 't1', role: 'USER' } };

describe('SpeakerController', () => {
  let controller: SpeakerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpeakerController],
      providers: [{ provide: SpeakerService, useValue: mockService }],
    }).compile();
    controller = module.get<SpeakerController>(SpeakerController);
    jest.clearAllMocks();
  });

  it('should call findAll', async () => {
    mockService.findAll.mockResolvedValue({ data: [], total: 0 });
    const result = await controller.findAll(mockReq as never, { page: 1, limit: 20 });
    expect(mockService.findAll).toHaveBeenCalledWith('t1', { page: 1, limit: 20 });
    expect(result.total).toBe(0);
  });

  it('should call create', async () => {
    mockService.create.mockResolvedValue({ id: '1' });
    const result = await controller.create(mockReq as never, { name: 'Jane', email: 'j@b.com' });
    expect(mockService.create).toHaveBeenCalledWith('t1', { name: 'Jane', email: 'j@b.com' });
    expect(result.id).toBe('1');
  });
});
