import { Test } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from '../infra/prisma.service';

const mockPrisma = {
  notification: {
    findMany: jest.fn(),
    count: jest.fn(),
    createMany: jest.fn(),
  },
};

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(NotificationService);
  });

  it('should return paginated notifications', async () => {
    mockPrisma.notification.findMany.mockResolvedValue([{ id: 'n1' }]);
    mockPrisma.notification.count.mockResolvedValue(1);
    const result = await service.findAll('u1', 1, 20);
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should broadcast to multiple users', async () => {
    mockPrisma.notification.createMany.mockResolvedValue({ count: 3 });
    const result = await service.broadcast({
      subject: 'Hello', body: 'World', userIds: ['u1', 'u2', 'u3'],
    });
    expect(result.sent).toBe(3);
  });
});
