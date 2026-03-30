import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { UpdateDispatchDto } from './dto/update-dispatch.dto';
import { DispatchStatus, Prisma } from '@prisma/client';
import { parsePagination } from '@fleet-dispatch/shared';

// TRACED: FD-DSP-002
@Injectable()
export class DispatchService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDispatchDto) {
    return this.prisma.dispatch.create({
      data: {
        status: (dto.status as DispatchStatus) ?? 'PENDING',
        scheduledAt: new Date(dto.scheduledAt),
        notes: dto.notes,
        vehicleId: dto.vehicleId,
        driverId: dto.driverId,
        routeId: dto.routeId,
        tenantId,
      },
      include: { vehicle: true, driver: true, route: true },
    });
  }

  async findAll(tenantId: string, page?: string, pageSize?: string) {
    const pagination = parsePagination(page, pageSize);
    const [items, total] = await Promise.all([
      this.prisma.dispatch.findMany({
        where: { tenantId },
        skip: pagination.skip,
        take: pagination.take,
        include: { vehicle: true, driver: true, route: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dispatch.count({ where: { tenantId } }),
    ]);

    return { items, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(tenantId: string, id: string) {
    const dispatch = await this.prisma.dispatch.findUnique({
      where: { id },
      include: { vehicle: true, driver: true, route: true },
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
        ...(dto.status !== undefined && { status: dto.status as DispatchStatus }),
        ...(dto.scheduledAt !== undefined && { scheduledAt: new Date(dto.scheduledAt) }),
        ...(dto.startedAt !== undefined && { startedAt: new Date(dto.startedAt) }),
        ...(dto.completedAt !== undefined && { completedAt: new Date(dto.completedAt) }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.totalCost !== undefined && { totalCost: new Prisma.Decimal(dto.totalCost) }),
      },
      include: { vehicle: true, driver: true, route: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.dispatch.delete({ where: { id } });
  }
}
