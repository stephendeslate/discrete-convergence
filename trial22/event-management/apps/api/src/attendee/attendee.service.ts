import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';
import { clampPagination, getPaginationSkip } from '@repo/shared';

// TRACED: EM-ATTENDEE-001
@Injectable()
export class AttendeeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; limit?: number }) {
    const pagination = clampPagination(query);
    const skip = getPaginationSkip(pagination);
    const [data, total] = await Promise.all([
      this.prisma.attendee.findMany({ where: { tenantId }, skip, take: pagination.limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.attendee.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, limit: pagination.limit };
  }

  async findOne(id: string, tenantId: string) {
    const attendee = await this.prisma.attendee.findUnique({ where: { id }, include: { tickets: true, registrations: true } });
    if (!attendee || attendee.tenantId !== tenantId) throw new NotFoundException('Attendee not found');
    return attendee;
  }

  async create(tenantId: string, dto: CreateAttendeeDto) {
    return this.prisma.attendee.create({ data: { ...dto, tenantId } });
  }

  async update(id: string, tenantId: string, dto: UpdateAttendeeDto) {
    await this.findOne(id, tenantId);
    return this.prisma.attendee.update({ where: { id }, data: dto });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.attendee.delete({ where: { id } });
  }
}
