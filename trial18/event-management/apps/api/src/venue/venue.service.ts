// TRACED: EM-VENUE-001
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { getPaginationParams } from '../common/pagination.utils';

@Injectable()
export class VenueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateVenueDto) {
    return this.prisma.venue.create({
      data: {
        name: dto.name,
        address: dto.address,
        capacity: dto.capacity ?? 0,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const params = getPaginationParams(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.venue.findMany({
        where: { tenantId },
        include: { events: true },
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.venue.count({ where: { tenantId } }),
    ]);
    return {
      data,
      total,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(total / params.pageSize),
    };
  }

  async findOne(tenantId: string, id: string) {
    // findFirst used because we need to scope by both id and tenantId for tenant isolation
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
        name: dto.name,
        address: dto.address,
        capacity: dto.capacity,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.venue.delete({ where: { id } });
  }
}
