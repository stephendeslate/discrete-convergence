import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { paginatedQuery } from '../common/paginated-query';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';

@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateRouteDto) {
    return this.prisma.route.create({
      data: {
        name: dto.name,
        origin: dto.origin,
        destination: dto.destination,
        distanceKm: dto.distanceKm,
        estimatedTime: dto.estimatedTime,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    return paginatedQuery(
      this.prisma.route, { tenantId }, page, limit,
      { include: { dispatches: true } },
    );
  }

  async findOne(tenantId: string, id: string) {
    // findFirst: scope by tenantId for RLS enforcement at application level
    const route = await this.prisma.route.findFirst({
      where: { id, tenantId },
      include: { dispatches: true },
    });
    if (!route) {
      throw new NotFoundException('Route not found');
    }
    return route;
  }

  async update(tenantId: string, id: string, dto: UpdateRouteDto) {
    const route = await this.findOne(tenantId, id);
    return this.prisma.route.update({ where: { id: route.id }, data: { ...dto } });
  }

  async remove(tenantId: string, id: string) {
    const route = await this.findOne(tenantId, id);
    return this.prisma.route.update({ where: { id: route.id }, data: { status: 'CANCELLED' } });
  }
}
