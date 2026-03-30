import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RouteStatus } from '@prisma/client';
import { PrismaService } from '../common/services/prisma.service';
import { clampPagination } from '@fleet-dispatch/shared';

const VALID_ROUTE_TRANSITIONS: Record<RouteStatus, RouteStatus[]> = {
  PLANNED: [RouteStatus.IN_PROGRESS],
  IN_PROGRESS: [RouteStatus.COMPLETED],
  COMPLETED: [],
};

@Injectable()
export class RoutesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    companyId: string,
    data: {
      date: string;
      technicianId: string;
      workOrderIds?: string[];
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const route = await tx.route.create({
        data: {
          date: new Date(data.date),
          technicianId: data.technicianId,
          companyId,
        },
        include: { stops: true, technician: true },
      });

      if (data.workOrderIds?.length) {
        await tx.routeStop.createMany({
          data: data.workOrderIds.map((workOrderId, index) => ({
            orderIndex: index,
            routeId: route.id,
            workOrderId,
          })),
        });
      }

      return tx.route.findUnique({
        where: { id: route.id },
        include: { stops: { include: { workOrder: true } }, technician: true },
      });
    });
  }

  async findAll(companyId: string, page?: number, perPageCount?: number) {
    const { pageSize: routePageSize, skip: routeSkip } = clampPagination(page, perPageCount);
    const [routes, routeCount] = await Promise.all([
      this.prisma.route.findMany({
        where: { companyId },
        include: { stops: { include: { workOrder: true } }, technician: true },
        skip: routeSkip,
        take: routePageSize,
        orderBy: { date: 'desc' },
      }),
      this.prisma.route.count({ where: { companyId } }),
    ]);
    return { data: routes, total: routeCount, page: page ?? 1, pageSize: routePageSize };
  }

  async findOne(companyId: string, routeId: string) {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
      include: { stops: { include: { workOrder: true } }, technician: true },
    });

    if (!route || route.companyId !== companyId) {
      throw new NotFoundException('Route not found');
    }

    return route;
  }

  async updateStatus(companyId: string, id: string, newStatus: RouteStatus) {
    const routeToTransition = await this.findOne(companyId, id);
    const validNext = VALID_ROUTE_TRANSITIONS[routeToTransition.status];

    if (!validNext.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid route status transition from ${routeToTransition.status} to ${newStatus}`,
      );
    }

    return this.prisma.route.update({
      where: { id: routeToTransition.id },
      data: { status: newStatus },
      include: { stops: { include: { workOrder: true } }, technician: true },
    });
  }

  async delete(companyId: string, routeId: string) {
    const routeToRemove = await this.findOne(companyId, routeId);
    await this.prisma.$transaction(async (tx) => {
      await tx.routeStop.deleteMany({ where: { routeId: routeToRemove.id } });
      await tx.route.delete({ where: { id: routeToRemove.id } });
    });
    return { deleted: true };
  }
}
