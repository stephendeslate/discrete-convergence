import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { clampPagination, paginatedResult } from '@event-management/shared';

// TRACED: EM-ATTEND-002
@Injectable()
export class AttendeeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateAttendeeDto) {
    // findFirst used because we check for duplicate attendance using composite unique fields
    const existing = await this.prisma.attendee.findFirst({
      where: { userId: dto.userId, eventId: dto.eventId },
    });
    if (existing) {
      throw new ConflictException('User already registered for this event');
    }
    return this.prisma.attendee.create({
      data: {
        user: { connect: { id: dto.userId } },
        event: { connect: { id: dto.eventId } },
        tenantId,
      },
      include: { user: true, event: true },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const params = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.attendee.findMany({
        where: { tenantId },
        include: { user: true, event: true },
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.attendee.count({ where: { tenantId } }),
    ]);
    return paginatedResult(data, total, params);
  }

  async findOne(tenantId: string, id: string) {
    const attendee = await this.prisma.attendee.findUnique({
      where: { id },
      include: { user: true, event: true },
    });
    if (!attendee || attendee.tenantId !== tenantId) {
      throw new NotFoundException('Attendee not found');
    }
    return attendee;
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.attendee.delete({ where: { id } });
  }
}
