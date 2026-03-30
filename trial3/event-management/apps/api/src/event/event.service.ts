// TRACED:EM-EVT-001
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import {
  getPaginationParams,
  buildPaginatedResult,
  PaginatedResult,
} from '../common/pagination.utils';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateEventDto,
    organizationId: string,
  ): Promise<Record<string, unknown>> {
    const event = await this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        slug: dto.slug,
        timezone: dto.timezone,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        capacity: dto.capacity,
        organizationId,
        venueId: dto.venueId,
      },
      include: { venue: true, ticketTypes: true },
    });
    return event as unknown as Record<string, unknown>;
  }

  async findAll(
    organizationId: string,
    query: { page?: number; limit?: number },
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const { skip, take, page, limit } = getPaginationParams(query);

    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where: { organizationId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { venue: true, ticketTypes: true },
      }),
      this.prisma.event.count({ where: { organizationId } }),
    ]);

    return buildPaginatedResult(
      data as unknown as Record<string, unknown>[],
      total,
      page,
      limit,
    );
  }

  async findOne(
    id: string,
    organizationId: string,
  ): Promise<Record<string, unknown>> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { venue: true, ticketTypes: true, sessions: true },
    });

    if (!event || event.organizationId !== organizationId) {
      throw new NotFoundException('Event not found');
    }

    return event as unknown as Record<string, unknown>;
  }

  async update(
    id: string,
    dto: UpdateEventDto,
    organizationId: string,
  ): Promise<Record<string, unknown>> {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing || existing.organizationId !== organizationId) {
      throw new NotFoundException('Event not found');
    }

    if (existing.status === 'COMPLETED') {
      throw new BadRequestException('Completed events cannot be edited');
    }

    const event = await this.prisma.event.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.timezone !== undefined && { timezone: dto.timezone }),
        ...(dto.startDate !== undefined && {
          startDate: new Date(dto.startDate),
        }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.capacity !== undefined && { capacity: dto.capacity }),
        ...(dto.venueId !== undefined && { venueId: dto.venueId }),
      },
      include: { venue: true, ticketTypes: true },
    });

    return event as unknown as Record<string, unknown>;
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing || existing.organizationId !== organizationId) {
      throw new NotFoundException('Event not found');
    }

    await this.prisma.event.delete({ where: { id } });
  }

  async publish(id: string, organizationId: string): Promise<Record<string, unknown>> {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing || existing.organizationId !== organizationId) {
      throw new NotFoundException('Event not found');
    }

    if (existing.status !== 'DRAFT') {
      throw new BadRequestException('Only draft events can be published');
    }

    const event = await this.prisma.event.update({
      where: { id },
      data: { status: 'PUBLISHED' },
      include: { venue: true, ticketTypes: true },
    });

    return event as unknown as Record<string, unknown>;
  }

  async cancel(id: string, organizationId: string): Promise<Record<string, unknown>> {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing || existing.organizationId !== organizationId) {
      throw new NotFoundException('Event not found');
    }

    if (existing.status === 'COMPLETED') {
      throw new BadRequestException('Completed events cannot be cancelled');
    }

    const event = await this.prisma.event.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { venue: true, ticketTypes: true },
    });

    return event as unknown as Record<string, unknown>;
  }

  // TRACED:EM-DATA-001
  async checkDatabaseHealth(): Promise<boolean> {
    const result = await this.prisma.$executeRaw(Prisma.sql`SELECT 1`);
    return result === 1;
  }
}
