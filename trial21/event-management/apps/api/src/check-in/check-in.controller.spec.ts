import { Test } from '@nestjs/testing';
import { CheckInController } from './check-in.controller';
import { CheckInService } from './check-in.service';

const mockCheckInService = {
  checkIn: jest.fn(),
  getStats: jest.fn(),
};

describe('CheckInController', () => {
  let controller: CheckInController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [CheckInController],
      providers: [{ provide: CheckInService, useValue: mockCheckInService }],
    }).compile();
    controller = module.get(CheckInController);
  });

  it('should check in a registration', async () => {
    const checkInResult = { status: 'checked_in', checkedInAt: new Date('2025-06-01T10:00:00Z') };
    mockCheckInService.checkIn.mockResolvedValue(checkInResult);

    const result = await controller.checkIn('r1');
    expect(result.status).toBe('checked_in');
    expect(result.checkedInAt).toBeDefined();
    expect(mockCheckInService.checkIn).toHaveBeenCalledWith('r1');
  });

  it('should return already_checked_in for idempotent scan', async () => {
    const checkInResult = { status: 'already_checked_in', checkedInAt: new Date('2025-06-01T09:00:00Z') };
    mockCheckInService.checkIn.mockResolvedValue(checkInResult);

    const result = await controller.checkIn('r1');
    expect(result.status).toBe('already_checked_in');
    expect(mockCheckInService.checkIn).toHaveBeenCalledTimes(1);
  });

  it('should return check-in statistics for an event', async () => {
    const stats = { total: 100, checkedIn: 60, pending: 40 };
    mockCheckInService.getStats.mockResolvedValue(stats);

    const result = await controller.stats('e1');
    expect(result.total).toBe(100);
    expect(result.checkedIn).toBe(60);
    expect(result.pending).toBe(40);
  });
});
