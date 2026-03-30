// TRACED:EM-VEN-001 TRACED:EM-VEN-002 TRACED:EM-VEN-003 TRACED:EM-VEN-004 TRACED:EM-VEN-005
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateVenueDto, UpdateVenueDto } from './venue.dto';
import { buildPaginatedResult, calculateSkip } from '../common/pagination.utils';
import { PaginatedResult } from '@repo/shared';
import { Venue } from '@prisma/client';

@Injectable()
export class VenueService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; pageSize?: number }): Promise<PaginatedResult<Venue>> {
    await this.prisma.setTenantContext(tenantId);
    const { skip, take } = calculateSkip(query);
    const [data, total] = await Promise.all([
      this.prisma.venue.findMany({ where: { tenantId }, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.venue.count({ where: { tenantId } }),
    ]);
    return buildPaginatedResult(data, total, query);
  }

  async findOne(id: string, tenantId: string): Promise<Venue> {
    await this.prisma.setTenantContext(tenantId);
    // tenant-scoped query — findFirst justified: PK + tenant isolation lookup
    const venue = await this.prisma.venue.findFirst({
      where: { id, tenantId },
      include: { events: true },
    });
    if (!venue) {
      throw new NotFoundException('Venue not found');
    }
    return venue;
  }

  async create(dto: CreateVenueDto, tenantId: string, userId: string): Promise<Venue> {
    await this.prisma.setTenantContext(tenantId);
    const venue = await this.prisma.venue.create({
      data: { ...dto, tenantId },
    });
    await this.prisma.auditLog.create({
      data: { action: 'CREATE', entity: 'Venue', entityId: venue.id, userId, tenantId },
    });
    return venue;
  }

  async update(id: string, dto: UpdateVenueDto, tenantId: string, userId: string): Promise<Venue> {
    await this.findOne(id, tenantId);
    const venue = await this.prisma.venue.update({
      where: { id },
      data: { ...dto },
    });
    await this.prisma.auditLog.create({
      data: { action: 'UPDATE', entity: 'Venue', entityId: venue.id, userId, tenantId },
    });
    return venue;
  }

  async remove(id: string, tenantId: string, userId: string): Promise<void> {
    await this.findOne(id, tenantId);
    await this.prisma.venue.delete({ where: { id } });
    await this.prisma.auditLog.create({
      data: { action: 'DELETE', entity: 'Venue', entityId: id, userId, tenantId },
    });
  }
}
