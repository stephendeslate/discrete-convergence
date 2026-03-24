// TRACED:EM-VENUE-001 — Venue service with CRUD
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { clampPagination, getPaginationSkip } from '@event-management/shared';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';

@Injectable()
export class VenueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVenueDto, organizationId: string) {
    return this.prisma.venue.create({
      data: { ...dto, organizationId },
    });
  }

  async findAll(organizationId: string, page?: number, limit?: number) {
    const { page: p, limit: l } = clampPagination(page, limit);
    const skip = getPaginationSkip(p, l);
    const [data, total] = await Promise.all([
      this.prisma.venue.findMany({ where: { organizationId }, skip, take: l }),
      this.prisma.venue.count({ where: { organizationId } }),
    ]);
    return { data, total, page: p, limit: l };
  }

  async findOne(id: string, organizationId: string) {
    // findFirst justified: fetching by id+organizationId for tenant scoping
    const venue = await this.prisma.venue.findFirst({
      where: { id, organizationId },
    });
    if (!venue) throw new NotFoundException('Venue not found');
    return venue;
  }

  async update(id: string, dto: UpdateVenueDto, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.venue.update({ where: { id }, data: dto });
  }

  async delete(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.venue.delete({ where: { id } });
  }
}
