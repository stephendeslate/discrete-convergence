// TRACED: FD-EDGE-008 — Optimistic locking on route assignment
// TRACED: FD-EDGE-009 — Concurrent work order assignment conflict returns 409
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { paginate, clampPagination, PaginatedResult } from '../common/pagination.utils';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';

@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateRouteDto) {
    await this.prisma.setTenantContext(companyId);
    return this.prisma.route.create({
      data: {
        name: dto.name,
        technicianId: dto.technicianId,
        date: dto.date,
        notes: dto.notes,
        companyId,
      },
    });
  }

  async findAll(companyId: string, page?: number, limit?: number): Promise<PaginatedResult<unknown>> {
    await this.prisma.setTenantContext(companyId);
    const clamped = clampPagination(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.route.findMany({
        where: { companyId },
        skip: clamped.offset,
        take: clamped.limit,
        orderBy: { createdAt: 'desc' },
        include: { stops: true },
      }),
      this.prisma.route.count({ where: { companyId } }),
    ]);

    return paginate(data, total, page, limit);
  }

  async findOne(companyId: string, id: string) {
    await this.prisma.setTenantContext(companyId);
    const route = await this.prisma.route.findFirst({
      where: { id, companyId },
      include: { stops: true },
    });

    if (!route) {
      throw new NotFoundException(`Route ${id} not found`);
    }

    return route;
  }

  async update(companyId: string, id: string, dto: UpdateRouteDto) {
    const existing = await this.findOne(companyId, id);
    await this.prisma.setTenantContext(companyId);

    try {
      return await this.prisma.route.update({
        where: { id, version: existing.version },
        data: {
          ...dto,
          version: { increment: 1 },
        },
      });
    } catch {
      throw new ConflictException(
        'Route was modified by another request. Please retry.',
      );
    }
  }

  async addStop(companyId: string, routeId: string, workOrderId: string, order: number) {
    await this.findOne(companyId, routeId);
    await this.prisma.setTenantContext(companyId);

    const existingStop = await this.prisma.routeStop.findFirst({
      where: { routeId, workOrderId },
    });

    if (existingStop) {
      throw new ConflictException(
        `Work order ${workOrderId} is already assigned to this route`,
      );
    }

    return this.prisma.routeStop.create({
      data: {
        routeId,
        workOrderId,
        order,
      },
    });
  }

  async removeStop(companyId: string, routeId: string, stopId: string) {
    await this.findOne(companyId, routeId);
    await this.prisma.setTenantContext(companyId);

    const stop = await this.prisma.routeStop.findFirst({
      where: { id: stopId, routeId },
    });

    if (!stop) {
      throw new NotFoundException(`Stop ${stopId} not found on route ${routeId}`);
    }

    return this.prisma.routeStop.delete({ where: { id: stopId } });
  }
}
