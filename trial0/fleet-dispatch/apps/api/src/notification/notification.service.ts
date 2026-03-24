// TRACED:FD-NOTIF-001
// TRACED:FD-NOTIF-002
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { clampPage, clampLimit, paginationMeta } from 'shared';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string, page?: number, limit?: number) {
    const p = clampPage(page);
    const l = clampLimit(limit);

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { companyId },
        skip: (p - 1) * l,
        take: l,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { companyId } }),
    ]);

    return { data, ...paginationMeta(total, p, l) };
  }

  async send(companyId: string, data: {
    type: 'ASSIGNMENT' | 'EN_ROUTE' | 'ARRIVAL' | 'COMPLETION' | 'INVOICE';
    channel: 'EMAIL' | 'SMS';
    recipient: string;
    subject: string;
    body: string;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        companyId,
        type: data.type,
        channel: data.channel,
        recipient: data.recipient,
        subject: data.subject,
        body: data.body,
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    return notification;
  }
}
