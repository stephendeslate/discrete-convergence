// TRACED:FD-ROUTE-001
// TRACED:FD-ROUTE-002
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async optimize(technicianId: string, workOrderIds: string[], companyId: string) {
    const technician = await this.prisma.technician.findFirst({
      // findFirst justified: technician lookup by ID with company scope
      where: { id: technicianId, companyId },
    });

    if (!technician) {
      throw new NotFoundException('Technician not found');
    }

    const today = new Date();
    const dateOnly = new Date(today.toISOString().split('T')[0] ?? '');

    const route = await this.prisma.route.upsert({
      where: {
        technicianId_date: { technicianId, date: dateOnly },
      },
      update: {
        optimizedAt: new Date(),
      },
      create: {
        technicianId,
        companyId,
        date: dateOnly,
        optimizedAt: new Date(),
      },
    });

    await this.prisma.routeStop.deleteMany({ where: { routeId: route.id } });

    const stops = workOrderIds.map((woId, index) => ({
      routeId: route.id,
      workOrderId: woId,
      stopOrder: index + 1,
    }));

    await this.prisma.routeStop.createMany({ data: stops });

    return this.prisma.route.findUnique({
      where: { id: route.id },
      include: {
        stops: {
          include: { workOrder: { include: { customer: true } } },
          orderBy: { stopOrder: 'asc' },
        },
        technician: { include: { user: true } },
      },
    });
  }

  async findByTechnicianAndDate(technicianId: string, date: Date, companyId: string) {
    const dateOnly = new Date(date.toISOString().split('T')[0] ?? '');

    // findFirst justified: unique constraint on [technicianId, date]
    const route = await this.prisma.route.findFirst({
      where: { technicianId, date: dateOnly, companyId },
      include: {
        stops: {
          include: { workOrder: { include: { customer: true } } },
          orderBy: { stopOrder: 'asc' },
        },
      },
    });

    if (!route) throw new NotFoundException('Route not found');
    return route;
  }

  async reorder(routeId: string, stopIds: string[], companyId: string) {
    // findFirst justified: route lookup with company scope
    const route = await this.prisma.route.findFirst({
      where: { id: routeId, companyId },
    });

    if (!route) throw new NotFoundException('Route not found');

    const updates = stopIds.map((stopId, index) =>
      this.prisma.routeStop.update({
        where: { id: stopId },
        data: { stopOrder: index + 1 },
      }),
    );

    await this.prisma.$transaction(updates);
    return this.findByTechnicianAndDate(route.technicianId, route.date, companyId);
  }
}
