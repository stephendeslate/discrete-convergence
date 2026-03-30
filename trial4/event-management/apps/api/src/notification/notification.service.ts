import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { clampPagination } from '@event-management/shared';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string, page?: number, pageSize?: number) {
    const { skip, take } = clampPagination(page, pageSize);
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { event: { organizationId } },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { event: true },
      }),
      this.prisma.notification.count({ where: { event: { organizationId } } }),
    ]);
    return { items, total, page: Math.floor(skip / take) + 1, pageSize: take };
  }

  async broadcast(eventId: string, dto: CreateNotificationDto, organizationId: string) {
    // findFirst: scoped by organizationId for tenant isolation
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, organizationId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.prisma.notification.create({
      data: {
        subject: dto.subject,
        body: dto.body,
        eventId,
        status: 'QUEUED',
      },
    });
  }
}
