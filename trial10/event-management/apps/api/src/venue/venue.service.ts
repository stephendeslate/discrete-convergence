// TRACED: EM-VENUE-001 — Venue CRUD service with tenant scoping
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { paginatedQuery } from '../common/paginated-query';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';

@Injectable()
export class VenueService {
  constructor(private readonly prisma: PrismaService) {}

  async setTenantContext(tenantId: string): Promise<void> {
    await this.prisma.$executeRaw(Prisma.sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`);
  }

  async create(tenantId: string, dto: CreateVenueDto) {
    await this.setTenantContext(tenantId);
    return this.prisma.venue.create({
      data: {
        name: dto.name,
        address: dto.address,
        capacity: dto.capacity,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    await this.setTenantContext(tenantId);
    return paginatedQuery(
      this.prisma.venue, { tenantId }, page, limit,
      { include: { events: true } },
    );
  }

  async findOne(tenantId: string, id: string) {
    await this.setTenantContext(tenantId);
    // findFirst: scope by tenantId for RLS enforcement at application level
    const venue = await this.prisma.venue.findFirst({
      where: { id, tenantId },
      include: { events: true },
    });
    if (!venue) {
      throw new NotFoundException('Venue not found');
    }
    return venue;
  }

  async update(tenantId: string, id: string, dto: UpdateVenueDto) {
    const venue = await this.findOne(tenantId, id);
    return this.prisma.venue.update({
      where: { id: venue.id },
      data: { ...dto },
    });
  }

  async remove(tenantId: string, id: string) {
    const venue = await this.findOne(tenantId, id);
    return this.prisma.venue.delete({ where: { id: venue.id } });
  }
}
