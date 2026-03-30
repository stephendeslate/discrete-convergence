import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { parsePagination } from '@event-management/shared';

// TRACED: EM-VENUE-002
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

  async findAll(tenantId: string, page?: string, pageSize?: string) {
    const pagination = parsePagination(page, pageSize);
    const [items, total] = await Promise.all([
      this.prisma.venue.findMany({
        where: { tenantId },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.venue.count({ where: { tenantId } }),
    ]);
    return { items, total, page: pagination.page, pageSize: pagination.pageSize };
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
