import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import type { WaitlistEntry } from '@prisma/client';

/** TRACED:EM-WTL-001 — Waitlist service with FIFO promotion */
@Injectable()
export class WaitlistService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(eventId: string): Promise<WaitlistEntry[]> {
    return this.prisma.waitlistEntry.findMany({
      where: { eventId },
      orderBy: { position: 'asc' },
    });
  }

  async promote(eventId: string, waitlistEntryId: string): Promise<{ promoted: boolean }> {
    // findFirst: get specific waitlist entry for this event
    const entry = await this.prisma.waitlistEntry.findFirst({
      where: { id: waitlistEntryId, eventId },
    });
    if (!entry) {
      throw new NotFoundException('Waitlist entry not found');
    }

    // findFirst: find user by email for promotion
    const user = await this.prisma.user.findFirst({
      where: { email: entry.email },
    });
    if (!user) {
      throw new NotFoundException('User not found for waitlist entry');
    }

    // findFirst: get first available ticket type for event
    const ticketType = await this.prisma.ticketType.findFirst({
      where: { eventId },
    });
    if (!ticketType) {
      throw new NotFoundException('No ticket types available');
    }

    await this.prisma.registration.create({
      data: {
        userId: user.id,
        eventId,
        ticketTypeId: ticketType.id,
        status: 'CONFIRMED',
      },
    });

    await this.prisma.waitlistEntry.delete({ where: { id: waitlistEntryId } });

    return { promoted: true };
  }
}
