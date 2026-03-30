// TRACED:EM-VEN-001
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import {
  getPaginationParams,
  buildPaginatedResult,
  PaginatedResult,
} from '../common/pagination.utils';

@Injectable()
export class VenueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateVenueDto,
    organizationId: string,
  ): Promise<Record<string, unknown>> {
    const venue = await this.prisma.venue.create({
      data: {
        name: dto.name,
        address: dto.address,
        city: dto.city,
        capacity: dto.capacity,
        isVirtual: dto.isVirtual ?? false,
        virtualUrl: dto.virtualUrl,
        organizationId,
      },
    });
    return venue as unknown as Record<string, unknown>;
  }

  async findAll(
    organizationId: string,
    query: { page?: number; limit?: number },
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const { skip, take, page, limit } = getPaginationParams(query);

    const [data, total] = await Promise.all([
      this.prisma.venue.findMany({
        where: { organizationId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { events: { select: { id: true, title: true } } },
      }),
      this.prisma.venue.count({ where: { organizationId } }),
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
    const venue = await this.prisma.venue.findUnique({
      where: { id },
      include: { events: { select: { id: true, title: true, status: true } } },
    });

    if (!venue || venue.organizationId !== organizationId) {
      throw new NotFoundException('Venue not found');
    }

    return venue as unknown as Record<string, unknown>;
  }

  async update(
    id: string,
    dto: UpdateVenueDto,
    organizationId: string,
  ): Promise<Record<string, unknown>> {
    const existing = await this.prisma.venue.findUnique({ where: { id } });
    if (!existing || existing.organizationId !== organizationId) {
      throw new NotFoundException('Venue not found');
    }

    const venue = await this.prisma.venue.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.capacity !== undefined && { capacity: dto.capacity }),
        ...(dto.isVirtual !== undefined && { isVirtual: dto.isVirtual }),
        ...(dto.virtualUrl !== undefined && { virtualUrl: dto.virtualUrl }),
      },
    });

    return venue as unknown as Record<string, unknown>;
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const existing = await this.prisma.venue.findUnique({ where: { id } });
    if (!existing || existing.organizationId !== organizationId) {
      throw new NotFoundException('Venue not found');
    }

    await this.prisma.venue.delete({ where: { id } });
  }
}
