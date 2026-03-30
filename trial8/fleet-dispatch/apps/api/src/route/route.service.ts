import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { LoggerService } from '../infra/logger.service';
import { CreateRouteDto, UpdateRouteDto } from './route.dto';
import { getPagination } from '../common/pagination.utils';

@Injectable()
export class RouteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async findAll(tenantId: string, query: { page?: number; pageSize?: number }) {
    const { skip, take, page, pageSize } = getPagination(query);
    const where = { tenantId };

    const [data, total] = await Promise.all([
      this.prisma.route.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.route.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: scoped by tenantId for tenant isolation
    const route = await this.prisma.route.findFirst({
      where: { id, tenantId },
      include: { trips: true },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    return route;
  }

  async create(dto: CreateRouteDto, tenantId: string) {
    const route = await this.prisma.route.create({
      data: {
        name: dto.name,
        origin: dto.origin,
        destination: dto.destination,
        distance: dto.distance,
        estimatedDuration: dto.estimatedDuration,
        tenantId,
      },
    });

    this.logger.log(`Route ${route.id} created`, 'RouteService');
    return route;
  }

  async update(id: string, dto: UpdateRouteDto, tenantId: string) {
    // findFirst: scoped by tenantId before update for tenant isolation
    const existing = await this.prisma.route.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Route not found');
    }

    return this.prisma.route.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, tenantId: string) {
    // findFirst: scoped by tenantId before delete for tenant isolation
    const existing = await this.prisma.route.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Route not found');
    }

    await this.prisma.route.delete({ where: { id } });
    return { deleted: true };
  }
}
