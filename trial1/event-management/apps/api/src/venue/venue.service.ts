// TRACED:EM-API-003 — Venue CRUD with capacity validation
// TRACED:EM-DATA-007 — Composite @@index on (organizationId, status) and relationship includes
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { clampPagination } from '@event-management/shared';
import { paginatedResult } from '../common/pagination';
import { CreateVenueDto } from './dto/create-venue.dto';
import { VenueType } from '@prisma/client';
import { UpdateVenueDto } from './dto/update-venue.dto';

@Injectable()
export class VenueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, dto: CreateVenueDto) {
    await this.prisma.setRLS(organizationId);
    return this.prisma.venue.create({
      data: { ...dto, type: dto.type as VenueType | undefined, organizationId },
    });
  }

  async findAll(organizationId: string, page?: number, pageSize?: number) {
    await this.prisma.setRLS(organizationId);
    const { skip, take } = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.venue.findMany({
        where: { organizationId },
        skip,
        take,
        orderBy: { name: 'asc' },
        include: { events: { select: { id: true, name: true, status: true } } },
      }),
      this.prisma.venue.count({ where: { organizationId } }),
    ]);
    return paginatedResult(data, total, skip, take);
  }

  async findOne(organizationId: string, id: string) {
    await this.prisma.setRLS(organizationId);
    // findFirst: required for tenant-scoped lookup — ensures organizationId match
    const venue = await this.prisma.venue.findFirst({ // tenant-scoped lookup
      where: { id, organizationId },
      include: { events: true },
    });
    if (!venue) {
      throw new NotFoundException('Venue not found');
    }
    return venue;
  }

  async update(organizationId: string, id: string, dto: UpdateVenueDto) {
    await this.findOne(organizationId, id);
    return this.prisma.venue.update({ where: { id }, data: dto });
  }

  async remove(organizationId: string, id: string) {
    await this.findOne(organizationId, id);
    return this.prisma.venue.delete({ where: { id } });
  }
}
