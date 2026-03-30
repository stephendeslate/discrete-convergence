import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { getPagination } from '../common/pagination.utils';

// TRACED:EM-API-003 — Venue service with full CRUD operations

@Injectable()
export class VenueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVenueDto, organizationId: string) {
    return this.prisma.venue.create({
      data: {
        name: dto.name,
        address: dto.address,
        city: dto.city,
        capacity: dto.capacity ?? 0,
        isVirtual: dto.isVirtual ?? false,
        organizationId,
      },
    });
  }

  async findAll(organizationId: string, params: { page?: number; pageSize?: number }) {
    const { skip, take, page, pageSize } = getPagination(params);

    const [items, total] = await Promise.all([
      this.prisma.venue.findMany({
        where: { organizationId },
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      this.prisma.venue.count({ where: { organizationId } }),
    ]);

    return { items, total, page, pageSize };
  }

  async findOne(id: string, organizationId: string) {
    const venue = await this.prisma.venue.findUnique({
      where: { id },
      include: { events: true },
    });

    if (!venue || venue.organizationId !== organizationId) {
      throw new NotFoundException('Venue not found');
    }

    return venue;
  }

  async update(id: string, dto: UpdateVenueDto, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.venue.update({
      where: { id },
      data: {
        name: dto.name,
        address: dto.address,
        city: dto.city,
        capacity: dto.capacity,
        isVirtual: dto.isVirtual,
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.venue.delete({ where: { id } });
  }
}
