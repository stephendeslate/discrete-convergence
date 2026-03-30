// TRACED:FD-RTE-003 — Route service
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { buildSkipTake, buildPaginatedResponse } from '../common/pagination.utils';
import { PaginationParams } from '@repo/shared';

@Injectable()
export class RouteService {
  private readonly logger = new Logger(RouteService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, params: PaginationParams) {
    await this.prisma.setTenantContext(tenantId);
    const { skip, take } = buildSkipTake(params);

    const [data, total] = await Promise.all([
      this.prisma.route.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.route.count({ where: { tenantId } }),
    ]);

    return buildPaginatedResponse(data, total, params);
  }

  async findOne(id: string, tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    // tenant-scoped query
    const route = await this.prisma.route.findFirst({
      where: { id, tenantId },
    });

    if (!route) {
      throw new NotFoundException(`Route ${id} not found`);
    }

    return route;
  }

  async create(dto: CreateRouteDto, tenantId: string, userId: string) {
    await this.prisma.setTenantContext(tenantId);

    const route = await this.prisma.route.create({
      data: {
        ...dto,
        tenantId,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Route',
        entityId: route.id,
        userId,
        tenantId,
        details: { name: dto.name },
      },
    });

    this.logger.log(`Route created: ${route.id}`);
    return route;
  }

  async update(id: string, dto: UpdateRouteDto, tenantId: string, userId: string) {
    await this.findOne(id, tenantId);

    const route = await this.prisma.route.update({
      where: { id },
      data: dto,
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'Route',
        entityId: route.id,
        userId,
        tenantId,
      },
    });

    return route;
  }

  async remove(id: string, tenantId: string, userId: string) {
    await this.findOne(id, tenantId);
    await this.prisma.route.delete({ where: { id } });

    await this.prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entity: 'Route',
        entityId: id,
        userId,
        tenantId,
      },
    });

    return { deleted: true };
  }
}
