// TRACED:FD-ROUTE-001 — route CRUD service with Decimal distance, tenant scoping, pagination
import { Injectable, NotFoundException } from '@nestjs/common';
import type { Route } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { clampPagination } from '@fleet-dispatch/shared';
import type { PaginatedResult } from '@fleet-dispatch/shared';
import { PrismaService } from '../common/services/prisma.service';
import type { CreateRouteDto } from './dto/create-route.dto';
import type { UpdateRouteDto } from './dto/update-route.dto';

@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRouteDto, tenantId: string): Promise<Route> {
    return this.prisma.route.create({
      data: {
        name: dto.name,
        origin: dto.origin,
        destination: dto.destination,
        waypoints: (dto.waypoints ?? []) as Prisma.InputJsonValue,
        distanceKm: new Decimal(dto.distanceKm),
        estimatedMinutes: dto.estimatedMinutes,
        tenantId,
      },
    });
  }

  async findAll(
    tenantId: string,
    page?: number,
    pageSize?: number,
  ): Promise<PaginatedResult<Route>> {
    const { page: p, pageSize: ps } = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.route.findMany({
        where: { tenantId },
        skip: (p - 1) * ps,
        take: ps,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.route.count({ where: { tenantId } }),
    ]);
    return {
      data,
      meta: { total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) },
    };
  }

  async findOne(id: string, tenantId: string): Promise<Route> {
    const route = await this.prisma.route.findUnique({
      where: { id },
    });
    if (!route || route.tenantId !== tenantId) {
      throw new NotFoundException('Route not found');
    }
    return route;
  }

  async update(id: string, dto: UpdateRouteDto, tenantId: string): Promise<Route> {
    await this.findOne(id, tenantId);
    const data: Prisma.RouteUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.origin !== undefined) data.origin = dto.origin;
    if (dto.destination !== undefined) data.destination = dto.destination;
    if (dto.waypoints !== undefined) data.waypoints = dto.waypoints as Prisma.InputJsonValue;
    if (dto.distanceKm !== undefined) data.distanceKm = new Decimal(dto.distanceKm);
    if (dto.estimatedMinutes !== undefined) data.estimatedMinutes = dto.estimatedMinutes;
    if (dto.actualMinutes !== undefined) data.actualMinutes = dto.actualMinutes;
    return this.prisma.route.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string): Promise<Route> {
    await this.findOne(id, tenantId);
    return this.prisma.route.delete({ where: { id } });
  }
}
