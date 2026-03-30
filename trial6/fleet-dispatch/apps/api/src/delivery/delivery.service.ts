// TRACED:FD-DEL-001 — delivery CRUD service with Decimal cost, tenant scoping, pagination
import { Injectable, NotFoundException } from '@nestjs/common';
import type { Delivery } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { clampPagination } from '@fleet-dispatch/shared';
import type { PaginatedResult } from '@fleet-dispatch/shared';
import { PrismaService } from '../common/services/prisma.service';
import type { CreateDeliveryDto } from './dto/create-delivery.dto';
import type { UpdateDeliveryDto } from './dto/update-delivery.dto';

@Injectable()
export class DeliveryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDeliveryDto, tenantId: string): Promise<Delivery> {
    return this.prisma.delivery.create({
      data: {
        trackingCode: dto.trackingCode,
        recipientName: dto.recipientName,
        address: dto.address,
        notes: dto.notes ?? null,
        cost: new Decimal(dto.cost),
        vehicleId: dto.vehicleId ?? null,
        driverId: dto.driverId ?? null,
        routeId: dto.routeId ?? null,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        tenantId,
      },
    });
  }

  async findAll(
    tenantId: string,
    page?: number,
    pageSize?: number,
    status?: string,
  ): Promise<PaginatedResult<Delivery>> {
    const { page: p, pageSize: ps } = clampPagination(page, pageSize);
    const where = {
      tenantId,
      ...(status && { status: status as Delivery['status'] }),
    };
    const [data, total] = await Promise.all([
      this.prisma.delivery.findMany({
        where,
        skip: (p - 1) * ps,
        take: ps,
        orderBy: { createdAt: 'desc' },
        include: { driver: true, vehicle: true, route: true },
      }),
      this.prisma.delivery.count({ where }),
    ]);
    return {
      data,
      meta: { total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) },
    };
  }

  async findOne(id: string, tenantId: string): Promise<Delivery> {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id },
      include: { driver: true, vehicle: true, route: true },
    });
    if (!delivery || delivery.tenantId !== tenantId) {
      throw new NotFoundException('Delivery not found');
    }
    return delivery;
  }

  async update(id: string, dto: UpdateDeliveryDto, tenantId: string): Promise<Delivery> {
    await this.findOne(id, tenantId);
    return this.prisma.delivery.update({
      where: { id },
      data: {
        ...(dto.recipientName !== undefined && { recipientName: dto.recipientName }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.status !== undefined && { status: dto.status as Delivery['status'] }),
        ...(dto.cost !== undefined && { cost: new Decimal(dto.cost) }),
        ...(dto.vehicleId !== undefined && { vehicleId: dto.vehicleId }),
        ...(dto.driverId !== undefined && { driverId: dto.driverId }),
        ...(dto.routeId !== undefined && { routeId: dto.routeId }),
        ...(dto.scheduledAt !== undefined && {
          scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        }),
        ...(dto.deliveredAt !== undefined && {
          deliveredAt: dto.deliveredAt ? new Date(dto.deliveredAt) : null,
        }),
      },
      include: { driver: true, vehicle: true, route: true },
    });
  }

  async remove(id: string, tenantId: string): Promise<Delivery> {
    await this.findOne(id, tenantId);
    return this.prisma.delivery.delete({ where: { id } });
  }
}
