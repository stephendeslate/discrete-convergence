import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';

/** TRACED:EM-CHK-001 — Check-in service with idempotent scanning */
@Injectable()
export class CheckInService {
  constructor(private readonly prisma: PrismaService) {}

  async checkIn(registrationId: string): Promise<{ status: string; checkedInAt: Date }> {
    const registration = await this.prisma.registration.findUnique({
      where: { id: registrationId },
    });
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }
    if (registration.status === 'CANCELLED') {
      throw new BadRequestException('Cannot check in a cancelled registration');
    }

    // Idempotent: scanning twice returns "already checked in" — TRACED:EM-CHK-002
    if (registration.status === 'CHECKED_IN') {
      // findFirst: get the existing check-in record
      const existing = await this.prisma.checkIn.findFirst({
        where: { registrationId },
        orderBy: { checkedInAt: 'desc' },
      });
      return {
        status: 'already_checked_in',
        checkedInAt: existing?.checkedInAt ?? new Date(),
      };
    }

    await this.prisma.registration.update({
      where: { id: registrationId },
      data: { status: 'CHECKED_IN' },
    });

    const checkIn = await this.prisma.checkIn.create({
      data: { registrationId },
    });

    return { status: 'checked_in', checkedInAt: checkIn.checkedInAt };
  }

  async getStats(eventId: string): Promise<{ total: number; checkedIn: number; pending: number }> {
    const [total, checkedIn, pending] = await Promise.all([
      this.prisma.registration.count({
        where: { eventId, status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
      }),
      this.prisma.registration.count({
        where: { eventId, status: 'CHECKED_IN' },
      }),
      this.prisma.registration.count({
        where: { eventId, status: 'CONFIRMED' },
      }),
    ]);
    return { total, checkedIn, pending };
  }
}
