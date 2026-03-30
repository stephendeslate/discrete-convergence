import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { OptimizeRouteDto } from './dto/optimize-route.dto';
import { ReorderStopsDto } from './dto/reorder-stops.dto';
import pino from 'pino';

const logger = pino({ name: 'route-service' });

/**
 * Route optimization and management.
 * TRACED: FD-ROUTE-001
 */
@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async optimize(tenantId: string, companyId: string, dto: OptimizeRouteDto) {
    const date = new Date(dto.date);

    const route = await this.prisma.route.create({
      data: {
        date,
        companyId,
        tenantId,
        optimizedAt: new Date(),
      },
    });

    // Create stops in order — nearest-neighbor heuristic placeholder
    for (let i = 0; i < dto.workOrderIds.length; i++) {
      await this.prisma.routeStop.create({
        data: {
          routeId: route.id,
          workOrderId: dto.workOrderIds[i],
          technicianId: dto.technicianId,
          stopOrder: i + 1,
        },
      });
    }

    logger.info({ routeId: route.id }, 'Route optimized');
    return this.prisma.route.findUnique({
      where: { id: route.id },
      include: { stops: { orderBy: { stopOrder: 'asc' }, include: { workOrder: true } } },
    });
  }

  async getByDate(tenantId: string, date: string) {
    const d = new Date(date);
    return this.prisma.route.findMany({
      where: { tenantId, date: d },
      include: {
        stops: {
          orderBy: { stopOrder: 'asc' },
          include: { workOrder: true, technician: true },
        },
      },
    });
  }

  async reorder(tenantId: string, routeId: string, dto: ReorderStopsDto) {
    const route = await this.prisma.route.findUnique({ where: { id: routeId } });
    if (!route || route.tenantId !== tenantId) {
      throw new NotFoundException('Route not found');
    }

    for (let i = 0; i < dto.stopIds.length; i++) {
      await this.prisma.routeStop.update({
        where: { id: dto.stopIds[i] },
        data: { stopOrder: i + 1 },
      });
    }

    return this.prisma.route.findUnique({
      where: { id: routeId },
      include: { stops: { orderBy: { stopOrder: 'asc' }, include: { workOrder: true } } },
    });
  }
}
