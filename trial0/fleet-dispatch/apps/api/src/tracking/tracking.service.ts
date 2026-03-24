// TRACED:FD-TRACK-001
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class TrackingService {
  constructor(private readonly prisma: PrismaService) {}

  async findByToken(token: string) {
    // findFirst justified: tracking token is unique, used for public customer portal without auth
    const workOrder = await this.prisma.workOrder.findFirst({
      where: {
        trackingToken: token,
        trackingExpiry: { gte: new Date() },
      },
      include: {
        technician: {
          select: {
            id: true,
            latitude: true,
            longitude: true,
            lastGpsAt: true,
            user: { select: { name: true } },
          },
        },
        customer: { select: { name: true, address: true, city: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!workOrder) {
      throw new NotFoundException('Tracking link expired or invalid');
    }

    return {
      id: workOrder.id,
      title: workOrder.title,
      status: workOrder.status,
      scheduledStart: workOrder.scheduledStart,
      technician: workOrder.technician,
      customer: workOrder.customer,
      statusHistory: workOrder.statusHistory,
    };
  }
}
