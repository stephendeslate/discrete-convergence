// TRACED: EM-API-004 — Venue service with CRUD operations
// TRACED: EM-EDGE-004 — Venue not found handling

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { getPaginationParams, paginate, PaginatedResult } from '../common/pagination.utils';
import { Venue } from '@prisma/client';

@Injectable()
export class VenueService {
  private readonly logger = new Logger(VenueService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateVenueDto): Promise<Venue> {
    // TRACED: EM-EDGE-012 — Validate capacity is positive
    if (dto.capacity <= 0) {
      throw new BadRequestException('Capacity must be a positive number');
    }

    const venue = await this.prisma.venue.create({
      data: {
        tenantId,
        name: dto.name,
        address: dto.address,
        capacity: dto.capacity,
      },
    });

    this.logger.log(`Venue created: ${venue.id}`);
    return venue;
  }

  async findAll(
    tenantId: string,
    page?: string,
    pageSize?: string,
  ): Promise<PaginatedResult<Venue>> {
    const { skip, take, page: p, pageSize: ps } = getPaginationParams(page, pageSize);

    const [data, total] = await Promise.all([
      this.prisma.venue.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.venue.count({ where: { tenantId } }),
    ]);

    return paginate(data, total, p, ps);
  }

  async findOne(tenantId: string, id: string): Promise<Venue> {
    // findFirst: tenant-scoped lookup by venue ID to enforce tenant isolation
    const venue = await this.prisma.venue.findFirst({
      where: { id, tenantId },
    });

    if (!venue) {
      // TRACED: EM-EDGE-004 — Venue not found
      throw new NotFoundException(`Venue with ID ${id} not found`);
    }

    return venue;
  }

  async update(tenantId: string, id: string, dto: UpdateVenueDto): Promise<Venue> {
    await this.findOne(tenantId, id);

    if (dto.capacity !== undefined && dto.capacity <= 0) {
      throw new BadRequestException('Capacity must be a positive number');
    }

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.capacity !== undefined) updateData.capacity = dto.capacity;

    return this.prisma.venue.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(tenantId: string, id: string): Promise<Venue> {
    await this.findOne(tenantId, id);
    return this.prisma.venue.delete({ where: { id } });
  }
}
