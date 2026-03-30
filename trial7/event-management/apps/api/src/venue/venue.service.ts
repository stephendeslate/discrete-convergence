import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateVenueDto, UpdateVenueDto } from './venue.dto';
import { clampPagination } from '@event-management/shared';

// TRACED:EM-VEN-003
@Injectable()
export class VenueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVenueDto, tenantId: string) {
    return this.prisma.venue.create({
      data: { ...dto, tenantId },
    });
  }

  async findAll(tenantId: string, page?: string, pageSize?: string) {
    const pagination = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.venue.findMany({
        where: { tenantId },
        include: { events: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.venue.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: filtering by id and tenantId for tenant-scoped access control
    const venue = await this.prisma.venue.findFirst({
      where: { id, tenantId },
      include: { events: true },
    });
    if (!venue) {
      throw new NotFoundException('Venue not found');
    }
    return venue;
  }

  async update(id: string, dto: UpdateVenueDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.venue.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.venue.delete({ where: { id } });
  }
}
