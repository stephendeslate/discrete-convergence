import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { Prisma } from '@prisma/client';
import { clampPagination } from '@fleet-dispatch/shared';
import type { CreateRouteDto } from './dto/create-route.dto';

// TRACED:FD-ROUTE-001
@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateRouteDto) {
    return this.prisma.$transaction(async (tx) => {
      const route = await tx.route.create({
        data: {
          companyId,
          technicianId: dto.technicianId,
          date: new Date(dto.date),
          totalDistance: new Prisma.Decimal(0),
          totalDuration: 0,
        },
      });

      const stops = dto.workOrderIds.map((workOrderId, index) =>
        tx.routeStop.create({
          data: {
            routeId: route.id,
            workOrderId,
            stopOrder: index + 1,
            legDistance: new Prisma.Decimal(0),
          },
        }),
      );

      await Promise.all(stops);

      return tx.route.findUnique({
        where: { id: route.id },
        include: {
          stops: {
            orderBy: { stopOrder: 'asc' },
            include: { workOrder: true },
          },
          technician: { include: { user: true } },
        },
      });
    });
  }

  async findAll(companyId: string, page?: number, pageSize?: number) {
    const { page: p, pageSize: ps } = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.route.findMany({
        where: { companyId },
        include: {
          stops: { orderBy: { stopOrder: 'asc' }, include: { workOrder: true } },
          technician: { include: { user: true } },
        },
        skip: (p - 1) * ps,
        take: ps,
        orderBy: { date: 'desc' },
      }),
      this.prisma.route.count({ where: { companyId } }),
    ]);
    return {
      data,
      meta: {
        page: p,
        pageSize: ps,
        total,
        totalPages: Math.ceil(total / ps),
      },
    };
  }

  async findOne(companyId: string, id: string) {
    const route = await this.prisma.route.findUnique({
      where: { id },
      include: {
        stops: {
          orderBy: { stopOrder: 'asc' },
          include: { workOrder: true },
        },
        technician: { include: { user: true } },
      },
    });
    if (!route || route.companyId !== companyId) {
      throw new NotFoundException('Route not found');
    }
    return route;
  }

  async remove(companyId: string, id: string) {
    const existing = await this.findOne(companyId, id);
    await this.prisma.routeStop.deleteMany({ where: { routeId: existing.id } });
    return this.prisma.route.delete({ where: { id: existing.id } });
  }
}
