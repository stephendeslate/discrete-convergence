// TRACED:API-ROUTE-SERVICE
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.module';
import { buildPaginatedResponse, buildSkipTake } from '../common/pagination.utils';
import { CreateRouteDto, UpdateRouteDto } from './dto';
import type { PaginatedResult } from '@fleet-dispatch/shared';
import type { Route } from '@prisma/client';

@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string, page: number, limit: number): Promise<PaginatedResult<Route>> {
    await this.prisma.setCompanyId(companyId);
    const { skip, take } = buildSkipTake(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.route.findMany({
        where: { companyId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.route.count({ where: { companyId } }),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string, companyId: string): Promise<Route> {
    await this.prisma.setCompanyId(companyId);
    // tenant-scoped query
    const route = await this.prisma.route.findFirst({
      where: { id, companyId },
    });
    if (!route) {
      throw new NotFoundException('Route not found');
    }
    return route;
  }

  async create(dto: CreateRouteDto, companyId: string): Promise<Route> {
    await this.prisma.setCompanyId(companyId);
    return this.prisma.route.create({
      data: { ...dto, companyId },
    });
  }

  async update(id: string, dto: UpdateRouteDto, companyId: string): Promise<Route> {
    await this.findOne(id, companyId);
    return this.prisma.route.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, companyId: string): Promise<Route> {
    await this.findOne(id, companyId);
    return this.prisma.route.delete({ where: { id } });
  }
}
