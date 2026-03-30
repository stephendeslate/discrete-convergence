// TRACED:ATTENDEE-SERVICE
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.module';
import { CreateAttendeeDto } from './dto';
import { buildPaginatedResponse, getPrismaSkipTake } from '../common/pagination.utils';

@Injectable()
export class AttendeeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAttendeeDto, organizationId: string) {
    return this.prisma.attendee.create({
      data: {
        name: dto.name,
        email: dto.email,
        ticketId: dto.ticketId,
        eventId: dto.eventId,
        organizationId,
      },
    });
  }

  async findAll(organizationId: string, page?: number, pageSize?: number) {
    const { skip, take } = getPrismaSkipTake(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.attendee.findMany({
        where: { organizationId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.attendee.count({ where: { organizationId } }),
    ]);
    return buildPaginatedResponse(data, total, page, pageSize);
  }

  async findOne(id: string, organizationId: string) {
    // tenant-scoped query
    const attendee = await this.prisma.attendee.findFirst({
      where: { id, organizationId },
      include: { ticket: true, event: true },
    });
    if (!attendee) {
      throw new NotFoundException('Attendee not found');
    }
    return attendee;
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    await this.prisma.attendee.delete({ where: { id } });
    return { deleted: true };
  }
}
