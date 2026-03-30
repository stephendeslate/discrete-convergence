import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { BroadcastNotificationDto } from './notification.dto';
import { buildPagination } from '../common/pagination.utils';
import type { Notification } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, page: number, limit: number): Promise<{ data: Notification[]; total: number }> {
    const { skip, take } = buildPagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);
    return { data, total };
  }

  async broadcast(dto: BroadcastNotificationDto): Promise<{ sent: number }> {
    const notifications = dto.userIds.map((userId) => ({
      subject: dto.subject,
      body: dto.body,
      userId,
    }));
    const result = await this.prisma.notification.createMany({ data: notifications });
    return { sent: result.count };
  }
}
