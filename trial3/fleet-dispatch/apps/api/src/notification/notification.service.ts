import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { clampPagination } from '@fleet-dispatch/shared';

// TRACED:FD-NOTIF-001
@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string, recipientId: string, page?: number, pageSize?: number) {
    const { page: p, pageSize: ps } = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { companyId, recipientId },
        skip: (p - 1) * ps,
        take: ps,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { companyId, recipientId } }),
    ]);
    return {
      data,
      meta: {
        page: p,
        pageSize: ps,
        total,
        totalPages: Math.ceil(total / ps),
      },
    };
  }

  async markAsRead(companyId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, companyId },
      data: { read: true },
    });
  }
}
