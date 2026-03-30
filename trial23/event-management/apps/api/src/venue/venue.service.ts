// TRACED: EM-API-002 — Venue CRUD with organization scoping
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { clampPagination } from '@repo/shared';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';

@Injectable()
export class VenueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, dto: CreateVenueDto) {
    return this.prisma.venue.create({
      data: {
        name: dto.name,
        address: dto.address ?? null,
        capacity: dto.capacity,
        organizationId,
      },
    });
  }

  async findAll(organizationId: string, page?: number, limit?: number) {
    const pagination = clampPagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.venue.findMany({
        where: { organizationId },
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.venue.count({ where: { organizationId } }),
    ]);
    return { data, total, page: pagination.page, limit: pagination.limit };
  }

  async findOne(organizationId: string, id: string) {
    // findFirst: scope by organizationId for tenant isolation at application level
    const venue = await this.prisma.venue.findFirst({
      where: { id, organizationId },
    });
    if (!venue) {
      throw new NotFoundException('Venue not found');
    }
    return venue;
  }

  async update(organizationId: string, id: string, dto: UpdateVenueDto) {
    const venue = await this.findOne(organizationId, id);
    return this.prisma.venue.update({
      where: { id: venue.id },
      data: { ...dto },
    });
  }

  async remove(organizationId: string, id: string) {
    const venue = await this.findOne(organizationId, id);
    return this.prisma.venue.delete({ where: { id: venue.id } });
  }
}
