import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { clampPagination } from '@event-management/shared';

@Injectable()
export class VenueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVenueDto, organizationId: string) {
    return this.prisma.venue.create({
      data: {
        name: dto.name,
        address: dto.address,
        capacity: dto.capacity,
        isVirtual: dto.isVirtual ?? false,
        organizationId,
      },
    });
  }

  async findAll(organizationId: string, page?: number, pageSize?: number) {
    const { skip, take } = clampPagination(page, pageSize);
    const [items, total] = await Promise.all([
      this.prisma.venue.findMany({
        where: { organizationId },
        skip,
        take,
        orderBy: { name: 'asc' },
        include: { _count: { select: { events: true } } },
      }),
      this.prisma.venue.count({ where: { organizationId } }),
    ]);
    return { items, total, page: Math.floor(skip / take) + 1, pageSize: take };
  }

  async findOne(id: string, organizationId: string) {
    // findFirst: scoped by organizationId for tenant isolation (id alone is not tenant-scoped)
    const venue = await this.prisma.venue.findFirst({
      where: { id, organizationId },
      include: { events: true },
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
        ...(dto.isVirtual !== undefined && { isVirtual: dto.isVirtual }),
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.venue.delete({ where: { id } });
  }
}
