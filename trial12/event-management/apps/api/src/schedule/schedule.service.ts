import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { clampPageSize, calculateSkip } from '@event-management/shared';

// TRACED: EM-SCHED-003
@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateScheduleDto) {
    return this.prisma.schedule.create({
      data: {
        title: dto.title,
        speaker: dto.speaker,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        room: dto.room,
        eventId: dto.eventId,
        tenantId,
      },
      include: { event: true },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const take = clampPageSize(pageSize);
    const skip = calculateSkip(page, pageSize);

    const [items, total] = await Promise.all([
      this.prisma.schedule.findMany({
        where: { tenantId },
        include: { event: true },
        take,
        skip,
        orderBy: { startTime: 'asc' },
      }),
      this.prisma.schedule.count({ where: { tenantId } }),
    ]);

    return { items, total, page: page ?? 1, pageSize: take };
  }

  async findOne(tenantId: string, id: string) {
    // findFirst used because we need tenant-scoped lookup (not just by primary key)
    const schedule = await this.prisma.schedule.findFirst({
      where: { id, tenantId },
      include: { event: true },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return schedule;
  }

  async update(tenantId: string, id: string, dto: UpdateScheduleDto) {
    await this.findOne(tenantId, id);
    return this.prisma.schedule.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.speaker !== undefined && { speaker: dto.speaker }),
        ...(dto.startTime !== undefined && { startTime: new Date(dto.startTime) }),
        ...(dto.endTime !== undefined && { endTime: new Date(dto.endTime) }),
        ...(dto.room !== undefined && { room: dto.room }),
      },
      include: { event: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.schedule.delete({ where: { id } });
  }
}
