import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { RouteStatus } from '@prisma/client';
import { parsePagination } from '@repo/shared';

// TRACED: FD-ROUTE-001
@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, limit: take } = parsePagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.route.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { stops: true },
      }),
      this.prisma.route.count({ where: { tenantId } }),
    ]);
    return { data, total, page: page ?? 1, limit: take };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst used because we scope by both id and tenantId for tenant isolation
    const route = await this.prisma.route.findFirst({
      where: { id, tenantId },
      include: { stops: true, trips: true },
    });
    if (!route) {
      throw new NotFoundException('Route not found');
    }
    return route;
  }

  async create(dto: CreateRouteDto, tenantId: string) {
    return this.prisma.route.create({
      data: {
        name: dto.name,
        description: dto.description,
        distance: dto.distance,
        status: (dto.status as RouteStatus) ?? 'DRAFT',
        tenantId,
      },
    });
  }

  async update(id: string, dto: UpdateRouteDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.route.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.distance !== undefined && { distance: dto.distance }),
        ...(dto.status && { status: dto.status as RouteStatus }),
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.route.delete({ where: { id } });
  }
}
