import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';
import { clampPagination } from '@event-management/shared';

// TRACED: EM-ATTENDEE-001
@Injectable()
export class AttendeeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const { skip, take } = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.attendee.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.attendee.count({ where: { tenantId } }),
    ]);
    return { data, total, page: page ?? 1, pageSize: take };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst used because we need composite tenant+id check without unique constraint on both
    const attendee = await this.prisma.attendee.findFirst({
      where: { id, tenantId },
      include: { registrations: true },
    });
    if (!attendee) {
      throw new NotFoundException('Attendee not found');
    }
    return attendee;
  }

  async create(dto: CreateAttendeeDto, tenantId: string) {
    return this.prisma.attendee.create({
      data: {
        name: dto.name,
        email: dto.email,
        tenantId,
      },
    });
  }

  async update(id: string, dto: UpdateAttendeeDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.attendee.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.email !== undefined && { email: dto.email }),
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.attendee.delete({ where: { id } });
  }
}
