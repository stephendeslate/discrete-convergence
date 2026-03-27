// TRACED: FD-API-008 — Maintenance service with tenant-scoped operations
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { paginate, buildPaginatedResult } from '../common/pagination.utils';

@Injectable()
export class MaintenanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, vehicleId: string, page?: number, pageSize?: number) {
    // TRACED: FD-EDGE-018 — Validate vehicle exists and belongs to tenant
    // findFirst: tenant-scoped lookup to validate vehicle ownership
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, tenantId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    const { skip, take, page: p, pageSize: ps } = paginate(page, pageSize);

    const [data, total] = await Promise.all([
      this.prisma.maintenanceLog.findMany({
        where: { vehicleId, tenantId },
        skip,
        take,
        orderBy: { performedAt: 'desc' },
      }),
      this.prisma.maintenanceLog.count({ where: { vehicleId, tenantId } }),
    ]);

    return buildPaginatedResult(data, total, p, ps);
  }

  async create(tenantId: string, vehicleId: string, dto: CreateMaintenanceDto) {
    // findFirst: tenant-scoped lookup to validate vehicle before creating maintenance log
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, tenantId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return this.prisma.maintenanceLog.create({
      data: {
        vehicleId,
        tenantId,
        type: dto.type,
        description: dto.description,
        cost: dto.cost ?? 0,
        performedAt: dto.performedAt ? new Date(dto.performedAt) : new Date(),
      },
    });
  }
}
