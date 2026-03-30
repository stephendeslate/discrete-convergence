import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { UpdateDispatchDto } from './dto/update-dispatch.dto';
import { DispatchStatus, Prisma } from '@prisma/client';
import { clampPagination } from '@fleet-dispatch/shared';

// TRACED:FD-DSP-003
@Injectable()
export class DispatchService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDispatchDto, dispatcherId: string) {
    return this.prisma.dispatch.create({
      data: {
        tenantId: dto.tenantId,
        vehicleId: dto.vehicleId,
        driverId: dto.driverId,
        routeId: dto.routeId,
        dispatcherId,
        scheduledAt: new Date(dto.scheduledAt),
        notes: dto.notes,
      },
      include: { vehicle: true, driver: true, route: true },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const pagination = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.dispatch.findMany({
        where: { tenantId },
        skip: pagination.skip,
        take: pagination.take,
        include: { vehicle: true, driver: true, route: true, dispatcher: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dispatch.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(id: string, tenantId: string) {
    const dispatch = await this.prisma.dispatch.findUnique({
      where: { id },
      include: { vehicle: true, driver: true, route: true, dispatcher: true },
    });
    if (!dispatch || dispatch.tenantId !== tenantId) {
      throw new NotFoundException('Dispatch not found');
    }
    return dispatch;
  }

  async update(id: string, tenantId: string, dto: UpdateDispatchDto) {
    await this.findOne(id, tenantId);
    return this.prisma.dispatch.update({
      where: { id },
      data: {
        status: dto.status ? (dto.status as DispatchStatus) : undefined,
        completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
        notes: dto.notes,
      },
      include: { vehicle: true, driver: true, route: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.dispatch.delete({ where: { id } });
  }

  // TRACED:FD-DATA-002
  async getDispatchStats(tenantId: string) {
    const result = await this.prisma.$executeRaw(Prisma.sql`
      SELECT COUNT(*) as total,
             SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as completed,
             SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
      FROM dispatches
      WHERE "tenantId" = ${tenantId}::uuid
    `);
    return { affectedRows: result };
  }
}
