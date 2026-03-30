import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { clampPagination } from '@event-management/shared';
import { CreateScheduleDto } from './dto/create-schedule.dto';

// TRACED: EM-API-008 — Schedule service with tenant-scoped CRUD
@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateScheduleDto, tenantId: string) {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    return this.prisma.schedule.create({
      data: {
        eventId: dto.eventId,
        title: dto.title,
        startTime,
        endTime,
        room: dto.room,
        speaker: dto.speaker,
        tenantId,
      },
      include: { event: true },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const pagination = clampPagination(page, pageSize);

    const [data, total] = await Promise.all([
      this.prisma.schedule.findMany({
        where: { tenantId },
        skip: pagination.skip,
        take: pagination.pageSize,
        orderBy: { startTime: 'asc' },
        include: { event: true },
      }),
      this.prisma.schedule.count({ where: { tenantId } }),
    ]);

    return { data, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: lookup schedule by ID scoped to tenant for isolation
    const schedule = await this.prisma.schedule.findFirst({
      where: { id, tenantId },
      include: { event: true },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return schedule;
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.schedule.delete({ where: { id } });
  }
}
