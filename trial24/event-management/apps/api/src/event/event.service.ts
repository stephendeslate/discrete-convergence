// TRACED:EVENT-SERVICE
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.module';
import { CreateEventDto, UpdateEventDto } from './dto';
import { buildPaginatedResponse, getPrismaSkipTake } from '../common/pagination.utils';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEventDto, organizationId: string) {
    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: dto.status ?? 'DRAFT',
        venueId: dto.venueId,
        organizationId,
      },
    });
  }

  async findAll(organizationId: string, page?: number, pageSize?: number) {
    const { skip, take } = getPrismaSkipTake(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where: { organizationId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.event.count({ where: { organizationId } }),
    ]);
    return buildPaginatedResponse(data, total, page, pageSize);
  }

  async findOne(id: string, organizationId: string) {
    // tenant-scoped query
    const event = await this.prisma.event.findFirst({
      where: { id, organizationId },
      include: { venue: true, sessions: true, tickets: true },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async update(id: string, dto: UpdateEventDto, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.event.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.venueId !== undefined && { venueId: dto.venueId }),
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    await this.prisma.event.delete({ where: { id } });
    return { deleted: true };
  }
}
