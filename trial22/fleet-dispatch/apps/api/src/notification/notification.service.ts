import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { parsePagination } from '@repo/shared';

// TRACED: FD-NOTIF-001
@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, limit: take } = parsePagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({ where: { tenantId }, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.notification.count({ where: { tenantId } }),
    ]);
    return { data, total, page: page ?? 1, limit: take };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst used because we scope by both id and tenantId for tenant isolation
    const notification = await this.prisma.notification.findFirst({ where: { id, tenantId } });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  async create(dto: CreateNotificationDto, tenantId: string) {
    return this.prisma.notification.create({
      data: { userId: dto.userId, title: dto.title, body: dto.body, tenantId },
    });
  }

  async markRead(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.notification.update({ where: { id }, data: { read: true } });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.notification.delete({ where: { id } });
  }
}
