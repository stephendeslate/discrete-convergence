import { NotificationService } from './notification.service';
import { createMockPrisma, MockPrisma } from '../../test/helpers/mock-prisma';

describe('NotificationService', () => {
  let service: NotificationService;
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new NotificationService(prisma as never);
  });

  describe('findAll', () => {
    it('should return notifications for user', async () => {
      prisma.notification.findMany.mockResolvedValue([]);

      const result = await service.findAll('user-1');
      expect(result).toEqual([]);
      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
    });
  });

  describe('markRead', () => {
    it('should mark notification as read', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 1 });

      await service.markRead('user-1', 'notif-1');
      expect(prisma.notification.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'notif-1', userId: 'user-1' },
          data: { read: true },
        }),
      );
    });
  });
});
