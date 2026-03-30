import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { clampPagination } from '@event-management/shared';

// TRACED: EM-VENUE-001
@Injectable()
export class VenueService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const { skip, take } = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.venue.findMany({
        where: { tenantId },
        include: { events: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.venue.count({ where: { tenantId } }),
    ]);
    return { data, total, page: page ?? 1, pageSize: take };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst used because we need composite tenant+id check without unique constraint on both
    const venue = await this.prisma.venue.findFirst({
      where: { id, tenantId },
      include: { events: true },
    });
    if (!venue) {
      throw new NotFoundException('Venue not found');
    }
    return venue;
  }

  async create(dto: CreateVenueDto, tenantId: string) {
    return this.prisma.venue.create({
      data: {
        name: dto.name,
        address: dto.address,
        capacity: dto.capacity,
        tenantId,
      },
    });
  }

  async update(id: string, dto: UpdateVenueDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.venue.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.capacity !== undefined && { capacity: dto.capacity }),
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.venue.delete({ where: { id } });
  }
}
