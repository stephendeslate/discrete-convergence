// TRACED:FD-DISP-002 — Dispatch service with N+1 prevention via Prisma include
// TRACED:FD-DATA-007 — Multi-tenant entity relationships: Dispatch references Vehicle, Driver, Route
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { paginatedQuery } from '../common/paginated-query';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { UpdateDispatchDto } from './dto/update-dispatch.dto';

@Injectable()
export class DispatchService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDispatchDto) {
    return this.prisma.dispatch.create({
      data: {
        vehicleId: dto.vehicleId,
        driverId: dto.driverId,
        routeId: dto.routeId,
        priority: dto.priority,
        notes: dto.notes,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    return paginatedQuery(
      this.prisma.dispatch, { tenantId }, page, limit,
      { include: { vehicle: true, driver: true, route: true } },
    );
  }

  async findOne(tenantId: string, id: string) {
    // findFirst: scope by tenantId for RLS enforcement at application level
    const dispatch = await this.prisma.dispatch.findFirst({
      where: { id, tenantId },
      include: { vehicle: true, driver: true, route: true },
    });
    if (!dispatch) {
      throw new NotFoundException('Dispatch not found');
    }
    return dispatch;
  }

  async update(tenantId: string, id: string, dto: UpdateDispatchDto) {
    const dispatch = await this.findOne(tenantId, id);
    return this.prisma.dispatch.update({
      where: { id: dispatch.id },
      data: {
        ...dto,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const dispatch = await this.findOne(tenantId, id);
    return this.prisma.dispatch.update({ where: { id: dispatch.id }, data: { status: 'FAILED' } });
  }
}
