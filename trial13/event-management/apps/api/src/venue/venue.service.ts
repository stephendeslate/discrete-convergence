import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { clampPagination } from '@event-management/shared';

// TRACED: EM-VENUE-001
@Injectable()
export class VenueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateVenueDto) {
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
    const pagination = clampPagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.venue.findMany({
        where: { tenantId },
        include: { events: true },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.venue.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, limit: pagination.limit };
  }

  async findOne(tenantId: string, id: string) {
    // findFirst used here because we filter by both id and tenantId for tenant isolation
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
    await this.findOne(tenantId, id);
    return this.prisma.venue.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.capacity !== undefined && { capacity: dto.capacity }),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.venue.delete({ where: { id } });
  }
}
