import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { clampPagination } from '@event-management/shared';
import { CreateVenueDto } from './dto/create-venue.dto';

@Injectable()
export class VenueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVenueDto, tenantId: string) {
    return this.prisma.venue.create({
      data: {
        name: dto.name,
        address: dto.address,
        city: dto.city,
        country: dto.country,
        capacity: dto.capacity,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const pagination = clampPagination(page, pageSize);

    const [data, total] = await Promise.all([
      this.prisma.venue.findMany({
        where: { tenantId },
        skip: pagination.skip,
        take: pagination.pageSize,
        orderBy: { name: 'asc' },
      }),
      this.prisma.venue.count({ where: { tenantId } }),
    ]);

    return { data, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: lookup venue by ID scoped to tenant
    const venue = await this.prisma.venue.findFirst({
      where: { id, tenantId },
      include: { events: true },
    });

    if (!venue) {
      throw new NotFoundException('Venue not found');
    }

    return venue;
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.venue.delete({ where: { id } });
  }
}
