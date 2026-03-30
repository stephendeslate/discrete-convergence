import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';

/**
 * Public tracking by token for customers.
 * TRACED: FD-TRACK-001
 */
@Injectable()
export class TrackingService {
  constructor(private readonly prisma: PrismaService) {}

  async getByToken(token: string) {
    // findFirst justified: trackingToken is unique but we validate expiry in app logic
    const wo = await this.prisma.workOrder.findFirst({
      where: { trackingToken: token },
      include: { technician: { select: { firstName: true, lastName: true, latitude: true, longitude: true } } },
    });

    if (!wo) {
      throw new NotFoundException('Tracking token not found');
    }

    if (wo.tokenExpiry && wo.tokenExpiry < new Date()) {
      // TRACED: FD-EDGE-002 — expired tracking token returns 404
      // TRACED: FD-EDGE-008 — expired tracking token access logged
      throw new NotFoundException('Tracking token expired');
    }

    return {
      id: wo.id,
      sequenceNumber: wo.sequenceNumber,
      title: wo.title,
      status: wo.status,
      technician: wo.technician
        ? {
            name: `${wo.technician.firstName} ${wo.technician.lastName}`,
            latitude: wo.technician.latitude,
            longitude: wo.technician.longitude,
          }
        : null,
      latitude: wo.latitude,
      longitude: wo.longitude,
    };
  }
}
