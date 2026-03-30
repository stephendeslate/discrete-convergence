import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { clampPagination, buildPaginatedResult } from '@fleet-dispatch/shared';

// TRACED: FD-ROUTE-001
@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const params = clampPagination(page, limit);
    const where = { tenantId };

    const [data, total] = await Promise.all([
      this.prisma.route.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: { dispatches: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.route.count({ where }),
    ]);

    return buildPaginatedResult(data, total, params);
  }

  async findOne(id: string, tenantId: string) {
    const route = await this.prisma.route.findUnique({
      where: { id },
      include: { dispatches: true },
    });

    if (!route || route.tenantId !== tenantId) {
      throw new NotFoundException('Route not found');
    }

    return route;
  }

  async create(tenantId: string, dto: CreateRouteDto) {
    return this.prisma.route.create({
      data: {
        name: dto.name,
        origin: dto.origin,
        destination: dto.destination,
        distance: dto.distance,
        estimatedDuration: dto.estimatedDuration,
        tenantId,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateRouteDto) {
    await this.findOne(id, tenantId);

    return this.prisma.route.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.origin !== undefined && { origin: dto.origin }),
        ...(dto.destination !== undefined && { destination: dto.destination }),
        ...(dto.distance !== undefined && { distance: dto.distance }),
        ...(dto.estimatedDuration !== undefined && { estimatedDuration: dto.estimatedDuration }),
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.route.delete({ where: { id } });
  }
}
