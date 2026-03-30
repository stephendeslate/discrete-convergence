// TRACED:FD-API-006 — RouteService with optimization and CRUD
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { clampPagination } from '@fleet-dispatch/shared';

@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string, page?: number, pageSize?: number) {
    const pagination = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.route.findMany({
        where: { companyId },
        include: { technician: { include: { user: true } }, stops: { include: { workOrder: true }, orderBy: { stopOrder: 'asc' } } },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { date: 'desc' },
      }),
      this.prisma.route.count({ where: { companyId } }),
    ]);
    return { data, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(companyId: string, id: string) {
    // findFirst: scoped by companyId for tenant isolation
    const route = await this.prisma.route.findFirst({
      where: { id, companyId },
      include: { technician: { include: { user: true } }, stops: { include: { workOrder: true }, orderBy: { stopOrder: 'asc' } } },
    });
    if (!route) {
      throw new NotFoundException('Route not found');
    }
    return route;
  }

  async optimize(companyId: string, technicianId: string, workOrderIds: string[]) {
    const stops = workOrderIds.map((woId, index) => ({
      workOrderId: woId,
      stopOrder: index + 1,
    }));

    return this.prisma.route.create({
      data: {
        technicianId,
        companyId,
        date: new Date(),
        totalDistance: new Prisma.Decimal(0),
        totalDuration: 0,
        stops: {
          create: stops,
        },
      },
      include: { stops: { include: { workOrder: true }, orderBy: { stopOrder: 'asc' } } },
    });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    await this.prisma.routeStop.deleteMany({ where: { routeId: id } });
    return this.prisma.route.delete({ where: { id } });
  }
}
