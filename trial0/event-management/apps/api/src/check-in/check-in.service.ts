// TRACED:EM-CHECKIN-001 — Check-in service with idempotent scan
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class CheckInService {
  constructor(private readonly prisma: PrismaService) {}

  async checkIn(registrationId: string, checkedInBy?: string) {
    // findFirst justified: fetching by id for check-in
    const registration = await this.prisma.registration.findFirst({
      where: { id: registrationId },
      include: { checkIn: true },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.status !== 'CONFIRMED') {
      throw new BadRequestException(`Cannot check in a ${registration.status} registration`);
    }

    // TRACED:EM-CHECKIN-002 — Idempotent check-in: scanning twice shows "already checked in"
    if (registration.checkIn) {
      return { alreadyCheckedIn: true, checkIn: registration.checkIn };
    }

    const [checkIn] = await this.prisma.$transaction([
      this.prisma.checkIn.create({
        data: { registrationId, checkedInBy },
      }),
      this.prisma.registration.update({
        where: { id: registrationId },
        data: { status: 'CHECKED_IN' },
      }),
    ]);

    return { alreadyCheckedIn: false, checkIn };
  }

  async getStats(eventId: string) {
    const [total, checkedIn] = await Promise.all([
      this.prisma.registration.count({
        where: { eventId, status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
      }),
      this.prisma.registration.count({
        where: { eventId, status: 'CHECKED_IN' },
      }),
    ]);
    return { total, checkedIn, remaining: total - checkedIn };
  }
}
