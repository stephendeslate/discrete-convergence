// TRACED:VENUE-SERVICE
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.module';
import { CreateVenueDto, UpdateVenueDto } from './dto';
import { buildPaginatedResponse, getPrismaSkipTake } from '../common/pagination.utils';

@Injectable()
export class VenueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVenueDto, organizationId: string) {
    return this.prisma.venue.create({
      data: {
        name: dto.name,
        address: dto.address,
        capacity: dto.capacity,
        organizationId,
      },
    });
  }

  async findAll(organizationId: string, page?: number, pageSize?: number) {
    const { skip, take } = getPrismaSkipTake(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.venue.findMany({
        where: { organizationId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.venue.count({ where: { organizationId } }),
    ]);
    return buildPaginatedResponse(data, total, page, pageSize);
  }

  async findOne(id: string, organizationId: string) {
    // tenant-scoped query
    const venue = await this.prisma.venue.findFirst({
      where: { id, organizationId },
    });
    if (!venue) {
      throw new NotFoundException('Venue not found');
    }
    return venue;
  }

  async update(id: string, dto: UpdateVenueDto, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.venue.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.capacity !== undefined && { capacity: dto.capacity }),
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    await this.prisma.venue.delete({ where: { id } });
    return { deleted: true };
  }
}
