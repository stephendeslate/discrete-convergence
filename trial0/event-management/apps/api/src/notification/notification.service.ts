// TRACED:EM-NOTIF-001 — Notification service with queuing and delivery tracking
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { clampPagination, getPaginationSkip, NOTIFICATION_RATE_LIMIT_MINUTES } from '@event-management/shared';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEvent(eventId: string, page?: number, limit?: number) {
    const { page: p, limit: l } = clampPagination(page, limit);
    const skip = getPaginationSkip(p, l);
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { eventId },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { eventId } }),
    ]);
    return { data, total, page: p, limit: l };
  }

  // TRACED:EM-NOTIF-002 — Broadcast with rate limiting per event
  async broadcast(eventId: string, subject: string, body: string) {
    const cutoff = new Date(Date.now() - NOTIFICATION_RATE_LIMIT_MINUTES * 60 * 1000);

    // findFirst justified: checking rate limit by most recent broadcast
    const recentBroadcast = await this.prisma.notification.findFirst({
      where: {
        eventId,
        type: 'UPDATE',
        createdAt: { gte: cutoff },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentBroadcast) {
      throw new BadRequestException('Rate limit: max 1 broadcast per event per hour');
    }

    const registrations = await this.prisma.registration.findMany({
      where: { eventId, status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
      include: { user: { select: { email: true } } },
    });

    const notifications = registrations.map((reg) => ({
      type: 'UPDATE' as const,
      recipient: reg.user.email,
      subject,
      body,
      eventId,
    }));

    await this.prisma.notification.createMany({ data: notifications });

    return { queued: notifications.length };
  }
}
