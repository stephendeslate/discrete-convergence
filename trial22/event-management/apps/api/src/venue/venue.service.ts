import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { clampPagination, getPaginationSkip } from '@repo/shared';

// TRACED: EM-VENUE-001
@Injectable()
export class VenueService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; limit?: number }) {
    const pagination = clampPagination(query);
    const skip = getPaginationSkip(pagination);
    const [data, total] = await Promise.all([
      this.prisma.venue.findMany({
        where: { tenantId },
        skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.venue.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, limit: pagination.limit };
  }

  async findOne(id: string, tenantId: string) {
    const venue = await this.prisma.venue.findUnique({ where: { id }, include: { events: true } });
    if (!venue || venue.tenantId !== tenantId) {
      throw new NotFoundException('Venue not found');
    }
    return venue;
  }

  async create(tenantId: string, dto: CreateVenueDto) {
    return this.prisma.venue.create({
      data: { ...dto, capacity: dto.capacity ?? 0, tenantId },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateVenueDto) {
    await this.findOne(id, tenantId);
    return this.prisma.venue.update({ where: { id }, data: dto });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.venue.delete({ where: { id } });
  }
}
