// TRACED: EM-ATTENDEE-001
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';
import { getPaginationParams } from '../common/pagination.utils';

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

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const params = getPaginationParams(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.attendee.findMany({
        where: { tenantId },
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.attendee.count({ where: { tenantId } }),
    ]);
    return {
      data,
      total,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(total / params.pageSize),
    };
  }

  async findOne(tenantId: string, id: string) {
    // findFirst used because we need to scope by both id and tenantId for tenant isolation
    const attendee = await this.prisma.attendee.findFirst({
      where: { id, tenantId },
      include: { registrations: true },
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
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.attendee.delete({ where: { id } });
  }
}
