import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { parsePagination } from '@event-management/shared';

// TRACED: EM-SCHED-002
@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateScheduleDto) {
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
        location: dto.location,
        tenantId,
      },
      include: { event: true },
    });
  }

  async findAll(tenantId: string, page?: string, pageSize?: string) {
    const pagination = parsePagination(page, pageSize);
    const [items, total] = await Promise.all([
      this.prisma.schedule.findMany({
        where: { tenantId },
        include: { event: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { startTime: 'asc' },
      }),
      this.prisma.schedule.count({ where: { tenantId } }),
    ]);
    return { items, total, page: pagination.page, pageSize: pagination.pageSize };
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
