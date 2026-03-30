import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { parsePagination } from '@event-management/shared';
import { Prisma } from '@prisma/client';

// TRACED: EM-ATTEND-002
@Injectable()
export class AttendeeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateAttendeeDto) {
    // findFirst used because checking unique constraint across composite key with custom error handling
    const existing = await this.prisma.attendee.findFirst({
      where: { eventId: dto.eventId, userId: dto.userId },
    });
    if (existing) {
      throw new ConflictException('Attendee already registered for this event');
    }

    try {
      return await this.prisma.attendee.create({
        data: {
          eventId: dto.eventId,
          userId: dto.userId,
          tenantId,
        },
        include: { event: true, user: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Attendee already registered for this event');
      }
      throw error;
    }
  }

  async findAll(tenantId: string, page?: string, pageSize?: string) {
    const pagination = parsePagination(page, pageSize);
    const [items, total] = await Promise.all([
      this.prisma.attendee.findMany({
        where: { tenantId },
        include: { event: true, user: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.attendee.count({ where: { tenantId } }),
    ]);
    return { items, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(tenantId: string, id: string) {
    const attendee = await this.prisma.attendee.findUnique({
      where: { id },
      include: { event: true, user: true },
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
