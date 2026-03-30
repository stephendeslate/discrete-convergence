import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateVenueDto, UpdateVenueDto } from './dto/create-venue.dto';
import { getPaginationParams, createPaginatedResult } from '../common/pagination.utils';

// TRACED: EM-VENUE-001
@Injectable()
export class VenueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVenueDto, tenantId: string) {
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

  async findAll(tenantId: string, page?: number, limit?: number) {
    const params = getPaginationParams(page, limit);
    const where = { tenantId };

    const [data, total] = await Promise.all([
      this.prisma.venue.findMany({
        where,
        include: { events: true },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.venue.count({ where }),
    ]);

    return createPaginatedResult(data, total, params);
  }

  async findOne(id: string, tenantId: string) {
    const venue = await this.prisma.venue.findUnique({
      where: { id },
      include: { events: true },
    });

    if (!venue || venue.tenantId !== tenantId) {
      throw new NotFoundException('Venue not found');
    }

    return venue;
  }

  async update(id: string, dto: UpdateVenueDto, tenantId: string) {
    await this.findOne(id, tenantId);

    return this.prisma.venue.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.capacity !== undefined && { capacity: dto.capacity }),
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.venue.delete({ where: { id } });
  }
}
