// TRACED:FD-ROUTE-001 — route CRUD service with Decimal distance, tenant scoping, pagination
import { Injectable, NotFoundException } from '@nestjs/common';
import type { Route } from '@prisma/client';
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
        waypoints: dto.waypoints ?? [],
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
    return this.prisma.route.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.origin !== undefined && { origin: dto.origin }),
        ...(dto.destination !== undefined && { destination: dto.destination }),
        ...(dto.waypoints !== undefined && { waypoints: dto.waypoints }),
        ...(dto.distanceKm !== undefined && { distanceKm: new Decimal(dto.distanceKm) }),
        ...(dto.estimatedMinutes !== undefined && { estimatedMinutes: dto.estimatedMinutes }),
        ...(dto.actualMinutes !== undefined && { actualMinutes: dto.actualMinutes }),
      },
    });
  }

  async remove(id: string, tenantId: string): Promise<Route> {
    await this.findOne(id, tenantId);
    return this.prisma.route.delete({ where: { id } });
  }
}
