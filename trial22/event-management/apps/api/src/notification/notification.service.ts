import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { clampPagination, getPaginationSkip } from '@repo/shared';
import { NotificationType } from '@prisma/client';

// TRACED: EM-NOTIF-001
@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; limit?: number }) {
    const pagination = clampPagination(query);
    const skip = getPaginationSkip(pagination);
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({ where: { tenantId }, skip, take: pagination.limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.notification.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, limit: pagination.limit };
  }

  async findOne(id: string, tenantId: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.tenantId !== tenantId) throw new NotFoundException('Notification not found');
    return notification;
  }

  async create(tenantId: string, dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        type: dto.type as NotificationType,
        subject: dto.subject,
        body: dto.body,
        tenantId,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateNotificationDto) {
    await this.findOne(id, tenantId);
    return this.prisma.notification.update({
      where: { id },
      data: {
        ...(dto.type !== undefined && { type: dto.type as NotificationType }),
        ...(dto.subject !== undefined && { subject: dto.subject }),
        ...(dto.body !== undefined && { body: dto.body }),
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.notification.delete({ where: { id } });
  }
}
