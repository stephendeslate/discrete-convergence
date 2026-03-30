// TRACED:EM-CHK-001
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CheckInService {
  constructor(private readonly prisma: PrismaService) {}

  async checkIn(
    registrationId: string,
    staffUserId: string,
    organizationId: string,
  ): Promise<Record<string, unknown>> {
    const registration = await this.prisma.registration.findUnique({
      where: { id: registrationId },
      include: { checkIns: true },
    });

    if (!registration || registration.organizationId !== organizationId) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.status !== 'CONFIRMED') {
      throw new BadRequestException(
        'Only confirmed registrations can be checked in',
      );
    }

    if (registration.checkIns.length > 0) {
      throw new BadRequestException('Already checked in');
    }

    const [checkIn] = await this.prisma.$transaction([
      this.prisma.checkIn.create({
        data: {
          registrationId,
          checkedInBy: staffUserId,
        },
        include: { registration: { include: { user: true, event: true } } },
      }),
      this.prisma.registration.update({
        where: { id: registrationId },
        data: { status: 'CHECKED_IN' },
      }),
    ]);

    return checkIn as unknown as Record<string, unknown>;
  }

  async getCheckInStats(
    eventId: string,
    organizationId: string,
  ): Promise<Record<string, unknown>> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.organizationId !== organizationId) {
      throw new NotFoundException('Event not found');
    }

    const totalRegistrations = await this.prisma.registration.count({
      where: { eventId, status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
    });

    const checkedIn = await this.prisma.registration.count({
      where: { eventId, status: 'CHECKED_IN' },
    });

    return {
      eventId,
      totalRegistrations,
      checkedIn,
      remaining: totalRegistrations - checkedIn,
      percentage:
        totalRegistrations > 0
          ? Math.round((checkedIn / totalRegistrations) * 100)
          : 0,
    };
  }
}
