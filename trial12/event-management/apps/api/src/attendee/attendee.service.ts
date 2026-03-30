import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { clampPageSize, calculateSkip } from '@event-management/shared';

// TRACED: EM-ATTEND-002
@Injectable()
export class AttendeeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateAttendeeDto) {
    // findFirst used because we check composite uniqueness with a descriptive conflict error
    const existing = await this.prisma.attendee.findFirst({
      where: { userId: dto.userId, eventId: dto.eventId },
    });

    if (existing) {
      throw new ConflictException('Attendee already registered for this event');
    }

    return this.prisma.attendee.create({
      data: {
        userId: dto.userId,
        eventId: dto.eventId,
        tenantId,
      },
      include: { user: true, event: true },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const take = clampPageSize(pageSize);
    const skip = calculateSkip(page, pageSize);

    const [items, total] = await Promise.all([
      this.prisma.attendee.findMany({
        where: { tenantId },
        include: { user: true, event: true },
        take,
        skip,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.attendee.count({ where: { tenantId } }),
    ]);

    return { items, total, page: page ?? 1, pageSize: take };
  }

  async findOne(tenantId: string, id: string) {
    // findFirst used because we need tenant-scoped lookup (not just by primary key)
    const attendee = await this.prisma.attendee.findFirst({
      where: { id, tenantId },
      include: { user: true, event: true },
    });

    if (!attendee) {
      throw new NotFoundException('Attendee not found');
    }

    return attendee;
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.attendee.delete({ where: { id } });
  }
}
