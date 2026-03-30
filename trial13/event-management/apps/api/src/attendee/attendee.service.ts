import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';
import { clampPagination } from '@event-management/shared';

// TRACED: EM-ATTENDEE-001
@Injectable()
export class AttendeeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateAttendeeDto) {
    return this.prisma.attendee.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    const pagination = clampPagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.attendee.findMany({
        where: { tenantId },
        include: { registrations: true },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.attendee.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, limit: pagination.limit };
  }

  async findOne(tenantId: string, id: string) {
    // findFirst used here because we filter by both id and tenantId for tenant isolation
    const attendee = await this.prisma.attendee.findFirst({
      where: { id, tenantId },
      include: { registrations: { include: { event: true } } },
    });
    if (!attendee) {
      throw new NotFoundException('Attendee not found');
    }
    return attendee;
  }

  async update(tenantId: string, id: string, dto: UpdateAttendeeDto) {
    await this.findOne(tenantId, id);
    return this.prisma.attendee.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.attendee.delete({ where: { id } });
  }
}
