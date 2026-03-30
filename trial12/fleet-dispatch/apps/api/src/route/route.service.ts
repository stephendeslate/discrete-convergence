// TRACED: FD-RTE-003
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { RouteStatus, Prisma } from '@prisma/client';
import { getPaginationParams } from '../common/pagination.utils';

@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateRouteDto) {
    return this.prisma.route.create({
      data: {
        name: dto.name,
        description: dto.description,
        distance: new Prisma.Decimal(dto.distance),
        estimatedTime: dto.estimatedTime,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, take } = getPaginationParams(page, limit);
    return this.prisma.route.findMany({
      where: { tenantId },
      skip,
      take,
      include: { stops: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const route = await this.prisma.route.findUnique({
      where: { id },
      include: { stops: true },
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
        name: dto.name,
        description: dto.description,
        status: dto.status ? (dto.status as RouteStatus) : undefined,
        distance: dto.distance !== undefined ? new Prisma.Decimal(dto.distance) : undefined,
        estimatedTime: dto.estimatedTime,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.route.delete({ where: { id } });
  }
}
