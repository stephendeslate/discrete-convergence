// TRACED:EM-API-003 — VenueService with full CRUD, tenant-scoped queries, pagination
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { buildPaginatedResult } from '../common/pagination.utils';
import { clampPagination } from '@event-management/shared';
import type { CreateVenueDto } from './dto/create-venue.dto';
import type { UpdateVenueDto } from './dto/update-venue.dto';
import type { PaginatedResult } from '../common/pagination.utils';
import type { Venue } from '@prisma/client';

@Injectable()
export class VenueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVenueDto): Promise<Venue> {
    return this.prisma.venue.create({
      data: {
        name: dto.name,
        address: dto.address,
        capacity: dto.capacity,
        tenantId: dto.tenantId,
      },
    });
  }

  async findAll(
    tenantId: string,
    params: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<Venue>> {
    const { skip, take } = clampPagination(params);
    const [data, total] = await Promise.all([
      this.prisma.venue.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.venue.count({ where: { tenantId } }),
    ]);
    return buildPaginatedResult(data, total, params);
  }

  async findOne(id: string, tenantId: string): Promise<Venue> {
    const venue = await this.prisma.venue.findUnique({ where: { id } });
    if (!venue || venue.tenantId !== tenantId) {
      throw new NotFoundException(`Venue ${id} not found`);
    }
    return venue;
  }

  async update(id: string, tenantId: string, dto: UpdateVenueDto): Promise<Venue> {
    await this.findOne(id, tenantId);
    return this.prisma.venue.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.capacity !== undefined && { capacity: dto.capacity }),
      },
    });
  }

  async remove(id: string, tenantId: string): Promise<Venue> {
    await this.findOne(id, tenantId);
    return this.prisma.venue.delete({ where: { id } });
  }
}
