import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateVenueDto, UpdateVenueDto } from './venue.dto';
import { buildPagination } from '../common/pagination.utils';
import type { Venue } from '@prisma/client';

@Injectable()
export class VenueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVenueDto, organizationId: string): Promise<Venue> {
    return this.prisma.venue.create({
      data: { ...dto, organizationId },
    });
  }

  async findAll(organizationId: string, page: number, limit: number): Promise<{ data: Venue[]; total: number }> {
    const { skip, take } = buildPagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.venue.findMany({ where: { organizationId }, skip, take }),
      this.prisma.venue.count({ where: { organizationId } }),
    ]);
    return { data, total };
  }

  async findOne(id: string, organizationId: string): Promise<Venue> {
    // findFirst: tenant-scoped lookup by id + organizationId
    const venue = await this.prisma.venue.findFirst({
      where: { id, organizationId },
    });
    if (!venue) {
      throw new NotFoundException('Venue not found');
    }
    return venue;
  }

  async update(id: string, dto: UpdateVenueDto, organizationId: string): Promise<Venue> {
    await this.findOne(id, organizationId);
    return this.prisma.venue.update({ where: { id }, data: dto });
  }

  async remove(id: string, organizationId: string): Promise<void> {
    await this.findOne(id, organizationId);
    await this.prisma.venue.delete({ where: { id } });
  }
}
