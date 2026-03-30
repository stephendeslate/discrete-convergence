// TRACED:FD-MAINT-002 — Maintenance service with Decimal cost field
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { paginatedQuery } from '../common/paginated-query';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';

@Injectable()
export class MaintenanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateMaintenanceDto) {
    return this.prisma.maintenanceRecord.create({
      data: {
        type: dto.type,
        description: dto.description,
        cost: dto.cost,
        vehicleId: dto.vehicleId,
        scheduledAt: new Date(dto.scheduledAt),
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    return paginatedQuery(
      this.prisma.maintenanceRecord, { tenantId }, page, limit,
      { include: { vehicle: true } },
    );
  }

  async findOne(tenantId: string, id: string) {
    // findFirst: scope by tenantId for RLS enforcement at application level
    const record = await this.prisma.maintenanceRecord.findFirst({
      where: { id, tenantId },
      include: { vehicle: true },
    });
    if (!record) {
      throw new NotFoundException('Maintenance record not found');
    }
    return record;
  }

  async update(tenantId: string, id: string, dto: UpdateMaintenanceDto) {
    const record = await this.findOne(tenantId, id);
    return this.prisma.maintenanceRecord.update({
      where: { id: record.id },
      data: {
        ...dto,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const record = await this.findOne(tenantId, id);
    return this.prisma.maintenanceRecord.update({ where: { id: record.id }, data: { status: 'CANCELLED' } });
  }
}
