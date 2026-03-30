import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { getSkipTake } from '../common/pagination.utils';
import { RouteStatus, Prisma } from '@prisma/client';

// TRACED: FD-ROUTE-002
@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, take } = getSkipTake(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.route.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.route.count({ where: { tenantId } }),
    ]);
    return { data, total, page: page ?? 1, limit: take };
  }

  async findOne(id: string, tenantId: string) {
    const route = await this.prisma.route.findUnique({
      where: { id },
    });
    if (!route || route.tenantId !== tenantId) {
      throw new NotFoundException('Route not found');
    }
    return route;
  }

  async create(dto: CreateRouteDto, tenantId: string) {
    return this.prisma.route.create({
      data: {
        name: dto.name,
        origin: dto.origin,
        destination: dto.destination,
        distance: dto.distance,
        estimatedTime: dto.estimatedTime,
        status: (dto.status as RouteStatus) ?? 'DRAFT',
        tenantId,
      },
    });
  }

  async update(id: string, dto: UpdateRouteDto, tenantId: string) {
    await this.findOne(id, tenantId);
    const data: Prisma.RouteUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.origin !== undefined) data.origin = dto.origin;
    if (dto.destination !== undefined) data.destination = dto.destination;
    if (dto.distance !== undefined) data.distance = dto.distance;
    if (dto.estimatedTime !== undefined) data.estimatedTime = dto.estimatedTime;
    if (dto.status !== undefined) data.status = dto.status as RouteStatus;
    return this.prisma.route.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.route.delete({ where: { id } });
  }
}
