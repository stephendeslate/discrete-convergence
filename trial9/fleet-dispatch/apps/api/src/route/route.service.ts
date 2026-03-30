import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { Prisma } from '@prisma/client';
import { parsePagination } from '@fleet-dispatch/shared';

// TRACED: FD-RTE-002
@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateRouteDto) {
    return this.prisma.route.create({
      data: {
        name: dto.name,
        origin: dto.origin,
        destination: dto.destination,
        distanceMiles: new Prisma.Decimal(dto.distanceMiles),
        estimatedTime: dto.estimatedTime,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: string, pageSize?: string) {
    const pagination = parsePagination(page, pageSize);
    const [items, total] = await Promise.all([
      this.prisma.route.findMany({
        where: { tenantId },
        skip: pagination.skip,
        take: pagination.take,
        include: { dispatches: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.route.count({ where: { tenantId } }),
    ]);

    return { items, total, page: pagination.page, pageSize: pagination.pageSize };
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
        ...(dto.origin !== undefined && { origin: dto.origin }),
        ...(dto.destination !== undefined && { destination: dto.destination }),
        ...(dto.distanceMiles !== undefined && { distanceMiles: new Prisma.Decimal(dto.distanceMiles) }),
        ...(dto.estimatedTime !== undefined && { estimatedTime: dto.estimatedTime }),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.route.delete({ where: { id } });
  }
}
