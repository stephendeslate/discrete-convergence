import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { clampPageSize, calculateSkip } from '@event-management/shared';

// TRACED: EM-VENUE-003
@Injectable()
export class VenueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateVenueDto) {
    return this.prisma.venue.create({
      data: {
        name: dto.name,
        address: dto.address,
        city: dto.city,
        capacity: dto.capacity,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const take = clampPageSize(pageSize);
    const skip = calculateSkip(page, pageSize);

    const [items, total] = await Promise.all([
      this.prisma.venue.findMany({
        where: { tenantId },
        include: { events: true },
        take,
        skip,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.venue.count({ where: { tenantId } }),
    ]);

    return { items, total, page: page ?? 1, pageSize: take };
  }

  async findOne(tenantId: string, id: string) {
    // findFirst used because we need tenant-scoped lookup (not just by primary key)
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
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.venue.delete({ where: { id } });
  }
}
