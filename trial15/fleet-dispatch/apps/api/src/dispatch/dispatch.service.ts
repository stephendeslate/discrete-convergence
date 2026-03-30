import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { UpdateDispatchDto } from './dto/update-dispatch.dto';
import { parsePagination } from '@fleet-dispatch/shared';
import { Prisma, DispatchStatus } from '@prisma/client';

// TRACED: FD-DISP-001
@Injectable()
export class DispatchService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDispatchDto) {
    return this.prisma.dispatch.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: (dto.status as DispatchStatus) ?? 'pending',
        priority: dto.priority ?? 0,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        estimatedCost: dto.estimatedCost
          ? new Prisma.Decimal(dto.estimatedCost)
          : undefined,
        vehicleId: dto.vehicleId,
        driverId: dto.driverId,
        routeId: dto.routeId,
        tenantId,
      },
      include: {
        vehicle: true,
        driver: true,
        route: true,
      },
    });
  }

  // TRACED: FD-PERF-003
  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const pagination = parsePagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.dispatch.findMany({
        where: { tenantId },
        include: {
          vehicle: true,
          driver: true,
          route: true,
        },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dispatch.count({ where: { tenantId } }),
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
    const dispatch = await this.prisma.dispatch.findUnique({
      where: { id },
      include: {
        vehicle: true,
        driver: true,
        route: true,
      },
    });

    if (!dispatch || dispatch.tenantId !== tenantId) {
      throw new NotFoundException('Dispatch not found');
    }

    return dispatch;
  }

  async update(tenantId: string, id: string, dto: UpdateDispatchDto) {
    await this.findOne(tenantId, id);

    return this.prisma.dispatch.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status as DispatchStatus }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.scheduledAt !== undefined && { scheduledAt: new Date(dto.scheduledAt) }),
        ...(dto.startedAt !== undefined && { startedAt: new Date(dto.startedAt) }),
        ...(dto.completedAt !== undefined && { completedAt: new Date(dto.completedAt) }),
        ...(dto.estimatedCost !== undefined && {
          estimatedCost: new Prisma.Decimal(dto.estimatedCost),
        }),
        ...(dto.actualCost !== undefined && {
          actualCost: new Prisma.Decimal(dto.actualCost),
        }),
        ...(dto.vehicleId !== undefined && { vehicleId: dto.vehicleId }),
        ...(dto.driverId !== undefined && { driverId: dto.driverId }),
        ...(dto.routeId !== undefined && { routeId: dto.routeId }),
      },
      include: {
        vehicle: true,
        driver: true,
        route: true,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.dispatch.delete({ where: { id } });
  }

  // TRACED: FD-DATA-003
  async getDispatchStats(tenantId: string) {
    const result = await this.prisma.$executeRaw(
      Prisma.sql`SELECT COUNT(*) FROM dispatches WHERE tenant_id = ${tenantId}`,
    );
    return { count: result };
  }
}
