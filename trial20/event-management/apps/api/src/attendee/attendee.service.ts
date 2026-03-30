import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateAttendeeDto, UpdateAttendeeDto } from './dto/create-attendee.dto';
import { getPaginationParams, createPaginatedResult } from '../common/pagination.utils';

// TRACED: EM-ATTEND-001
@Injectable()
export class AttendeeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAttendeeDto, tenantId: string) {
    return this.prisma.attendee.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    const params = getPaginationParams(page, limit);
    const where = { tenantId };

    const [data, total] = await Promise.all([
      this.prisma.attendee.findMany({
        where,
        include: { registrations: true },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.attendee.count({ where }),
    ]);

    return createPaginatedResult(data, total, params);
  }

  async findOne(id: string, tenantId: string) {
    const attendee = await this.prisma.attendee.findUnique({
      where: { id },
      include: { registrations: true },
    });

    if (!attendee || attendee.tenantId !== tenantId) {
      throw new NotFoundException('Attendee not found');
    }

    return attendee;
  }

  async update(id: string, dto: UpdateAttendeeDto, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.attendee.update({
      where: { id },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.attendee.delete({ where: { id } });
  }
}
