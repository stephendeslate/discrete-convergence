import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { clampPagination, paginatedResult } from '@event-management/shared';

// TRACED: EM-SCHED-002
@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateScheduleDto) {
    return this.prisma.schedule.create({
      data: {
        title: dto.title,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        location: dto.location,
        event: { connect: { id: dto.eventId } },
        tenantId,
      },
      include: { event: true },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const params = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.schedule.findMany({
        where: { tenantId },
        include: { event: true },
        skip: params.skip,
        take: params.take,
        orderBy: { startTime: 'asc' },
      }),
      this.prisma.schedule.count({ where: { tenantId } }),
    ]);
    return paginatedResult(data, total, params);
  }

  async findOne(tenantId: string, id: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: { event: true },
    });
    if (!schedule || schedule.tenantId !== tenantId) {
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
        ...(dto.startTime !== undefined && { startTime: new Date(dto.startTime) }),
        ...(dto.endTime !== undefined && { endTime: new Date(dto.endTime) }),
        ...(dto.location !== undefined && { location: dto.location }),
      },
      include: { event: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.schedule.delete({ where: { id } });
  }
}
