import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';

/**
 * Notification retrieval for authenticated users.
 * TRACED: FD-NOTIF-001
 */
@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(userId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }
}
