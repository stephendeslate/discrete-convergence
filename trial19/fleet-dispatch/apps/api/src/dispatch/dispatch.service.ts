import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { UpdateDispatchDto } from './dto/update-dispatch.dto';
import { DispatchStatus } from '@prisma/client';
import { clampPagination, buildPaginatedResult } from '@fleet-dispatch/shared';

// TRACED: FD-DISP-001
@Injectable()
export class DispatchService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const params = clampPagination(page, limit);
    const where = { tenantId };

    const [data, total] = await Promise.all([
      this.prisma.dispatch.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: { vehicle: true, driver: true, route: true },
        orderBy: { scheduledAt: 'desc' },
      }),
      this.prisma.dispatch.count({ where }),
    ]);

    return buildPaginatedResult(data, total, params);
  }

  async findOne(id: string, tenantId: string) {
    const dispatch = await this.prisma.dispatch.findUnique({
      where: { id },
      include: { vehicle: true, driver: true, route: true },
    });

    if (!dispatch || dispatch.tenantId !== tenantId) {
      throw new NotFoundException('Dispatch not found');
    }

    return dispatch;
  }

  async create(tenantId: string, dto: CreateDispatchDto) {
    return this.prisma.dispatch.create({
      data: {
        vehicleId: dto.vehicleId,
        driverId: dto.driverId,
        routeId: dto.routeId,
        status: dto.status as DispatchStatus,
        scheduledAt: new Date(dto.scheduledAt),
        tenantId,
      },
      include: { vehicle: true, driver: true, route: true },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateDispatchDto) {
    await this.findOne(id, tenantId);

    return this.prisma.dispatch.update({
      where: { id },
      data: {
        ...(dto.vehicleId !== undefined && { vehicleId: dto.vehicleId }),
        ...(dto.driverId !== undefined && { driverId: dto.driverId }),
        ...(dto.routeId !== undefined && { routeId: dto.routeId }),
        ...(dto.status !== undefined && { status: dto.status as DispatchStatus }),
        ...(dto.scheduledAt !== undefined && { scheduledAt: new Date(dto.scheduledAt) }),
      },
      include: { vehicle: true, driver: true, route: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dispatch.delete({ where: { id } });
  }
}
