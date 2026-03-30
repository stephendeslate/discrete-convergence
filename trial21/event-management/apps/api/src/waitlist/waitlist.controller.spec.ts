import { Test } from '@nestjs/testing';
import { WaitlistController } from './waitlist.controller';
import { WaitlistService } from './waitlist.service';

const mockWaitlistService = {
  findAll: jest.fn(),
  promote: jest.fn(),
};

describe('WaitlistController', () => {
  let controller: WaitlistController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [WaitlistController],
      providers: [{ provide: WaitlistService, useValue: mockWaitlistService }],
    }).compile();
    controller = module.get(WaitlistController);
  });

  it('should return waitlist entries for an event', async () => {
    const entries = [{ id: 'w1', position: 1 }, { id: 'w2', position: 2 }];
    mockWaitlistService.findAll.mockResolvedValue(entries);

    const result = await controller.findAll('e1');
    expect(result).toHaveLength(2);
    expect(result[0].position).toBe(1);
    expect(mockWaitlistService.findAll).toHaveBeenCalledWith('e1');
  });

  it('should promote a waitlist entry', async () => {
    const promoted = { promoted: true, registrationId: 'r1' };
    mockWaitlistService.promote.mockResolvedValue(promoted);

    const result = await controller.promote('e1', 'w1');
    expect(result.promoted).toBe(true);
    expect(mockWaitlistService.promote).toHaveBeenCalledWith('e1', 'w1');
  });
});
