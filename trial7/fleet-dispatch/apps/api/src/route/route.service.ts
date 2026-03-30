import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { RouteStatus, Prisma } from '@prisma/client';
import { clampPagination } from '@fleet-dispatch/shared';

// TRACED:FD-RTE-003
@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRouteDto) {
    return this.prisma.route.create({
      data: {
        tenantId: dto.tenantId,
        name: dto.name,
        origin: dto.origin,
        destination: dto.destination,
        distanceKm: new Prisma.Decimal(dto.distanceKm),
      },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const pagination = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.route.findMany({
        where: { tenantId },
        skip: pagination.skip,
        take: pagination.take,
        include: { dispatches: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.route.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(id: string, tenantId: string) {
    const route = await this.prisma.route.findUnique({
      where: { id },
      include: { dispatches: true },
    });
    if (!route || route.tenantId !== tenantId) {
      throw new NotFoundException('Route not found');
    }
    return route;
  }

  async update(id: string, tenantId: string, dto: UpdateRouteDto) {
    await this.findOne(id, tenantId);
    return this.prisma.route.update({
      where: { id },
      data: {
        ...dto,
        status: dto.status ? (dto.status as RouteStatus) : undefined,
        distanceKm: dto.distanceKm !== undefined ? new Prisma.Decimal(dto.distanceKm) : undefined,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.route.delete({ where: { id } });
  }
}
