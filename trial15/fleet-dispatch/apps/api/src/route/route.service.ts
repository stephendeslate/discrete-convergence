import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { parsePagination } from '@fleet-dispatch/shared';
import { Prisma, RouteStatus } from '@prisma/client';

// TRACED: FD-ROUTE-001
@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateRouteDto) {
    return this.prisma.route.create({
      data: {
        name: dto.name,
        description: dto.description,
        origin: dto.origin,
        destination: dto.destination,
        distance: dto.distance
          ? new Prisma.Decimal(dto.distance)
          : new Prisma.Decimal(0),
        estimatedDuration: dto.estimatedDuration ?? 0,
        status: (dto.status as RouteStatus) ?? 'draft',
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const pagination = parsePagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.route.findMany({
        where: { tenantId },
        include: { dispatches: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.route.count({ where: { tenantId } }),
    ]);

    return {
      data,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize),
    };
  }

  async findOne(tenantId: string, id: string) {
    const route = await this.prisma.route.findUnique({
      where: { id },
      include: { dispatches: true },
    });

    if (!route || route.tenantId !== tenantId) {
      throw new NotFoundException('Route not found');
    }

    return route;
  }

  async update(tenantId: string, id: string, dto: UpdateRouteDto) {
    await this.findOne(tenantId, id);

    return this.prisma.route.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.origin !== undefined && { origin: dto.origin }),
        ...(dto.destination !== undefined && { destination: dto.destination }),
        ...(dto.distance !== undefined && {
          distance: new Prisma.Decimal(dto.distance),
        }),
        ...(dto.estimatedDuration !== undefined && {
          estimatedDuration: dto.estimatedDuration,
        }),
        ...(dto.status !== undefined && { status: dto.status as RouteStatus }),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.route.delete({ where: { id } });
  }
}
