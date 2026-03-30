import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { clampPagination, paginatedResult } from '@event-management/shared';

// TRACED: EM-VENUE-002
@Injectable()
export class VenueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateVenueDto) {
    return this.prisma.venue.create({
      data: { ...dto, tenantId },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const params = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.venue.findMany({
        where: { tenantId },
        skip: params.skip,
        take: params.take,
        orderBy: { name: 'asc' },
        include: { events: true },
      }),
      this.prisma.venue.count({ where: { tenantId } }),
    ]);
    return paginatedResult(data, total, params);
  }

  async findOne(tenantId: string, id: string) {
    const venue = await this.prisma.venue.findUnique({
      where: { id },
      include: { events: true },
    });
    if (!venue || venue.tenantId !== tenantId) {
      throw new NotFoundException('Venue not found');
    }
    return venue;
  }

  async update(tenantId: string, id: string, dto: UpdateVenueDto) {
    await this.findOne(tenantId, id);
    return this.prisma.venue.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.venue.delete({ where: { id } });
  }
}
