import { Test } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

const mockNotificationService = {
  findAll: jest.fn(),
  broadcast: jest.fn(),
};

describe('NotificationController', () => {
  let controller: NotificationController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [{ provide: NotificationService, useValue: mockNotificationService }],
    }).compile();
    controller = module.get(NotificationController);
  });

  it('should return paginated notifications for a user', async () => {
    const paginated = { data: [{ id: 'n1', subject: 'Hello' }], total: 1 };
    mockNotificationService.findAll.mockResolvedValue(paginated);
    const req = { user: { id: 'u1' } };

    const result = await controller.findAll({ page: 1, limit: 20 }, req);
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(mockNotificationService.findAll).toHaveBeenCalledWith('u1', 1, 20);
  });

  it('should broadcast a notification to multiple users', async () => {
    mockNotificationService.broadcast.mockResolvedValue({ sent: 5 });

    const result = await controller.broadcast({
      subject: 'Event Update',
      body: 'The event has been rescheduled.',
      userIds: ['u1', 'u2', 'u3', 'u4', 'u5'],
    });
    expect(result.sent).toBe(5);
    expect(mockNotificationService.broadcast).toHaveBeenCalledWith({
      subject: 'Event Update',
      body: 'The event has been rescheduled.',
      userIds: ['u1', 'u2', 'u3', 'u4', 'u5'],
    });
  });
});
