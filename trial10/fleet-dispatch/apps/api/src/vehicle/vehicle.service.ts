// TRACED:FD-DATA-006 — executeRaw with Prisma.sql for RLS tenant context
// TRACED:FD-DATA-004 — Decimal for monetary fields, never Float
// TRACED:FD-DATA-001 — Queries against models with @@map snake_case table names
// TRACED:FD-API-005 — Pagination clamping with clampPagination from shared
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { paginatedQuery } from '../common/paginated-query';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(private readonly prisma: PrismaService) {}

  async setTenantContext(tenantId: string): Promise<void> {
    await this.prisma.$executeRaw(Prisma.sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`);
  }

  async create(tenantId: string, dto: CreateVehicleDto) {
    await this.setTenantContext(tenantId);
    return this.prisma.vehicle.create({
      data: {
        licensePlate: dto.licensePlate,
        make: dto.make,
        model: dto.model,
        year: dto.year,
        fuelCapacity: dto.fuelCapacity,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    await this.setTenantContext(tenantId);
    return paginatedQuery(
      this.prisma.vehicle, { tenantId }, page, limit,
      { include: { dispatches: true } },
    );
  }

  async findOne(tenantId: string, id: string) {
    await this.setTenantContext(tenantId);
    // findFirst: scope by tenantId for RLS enforcement at application level
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, tenantId },
      include: { dispatches: true, maintenanceRecords: true },
    });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
    return vehicle;
  }

  async update(tenantId: string, id: string, dto: UpdateVehicleDto) {
    const vehicle = await this.findOne(tenantId, id);
    return this.prisma.vehicle.update({ where: { id: vehicle.id }, data: { ...dto } });
  }

  async remove(tenantId: string, id: string) {
    const vehicle = await this.findOne(tenantId, id);
    return this.prisma.vehicle.update({ where: { id: vehicle.id }, data: { status: 'RETIRED' } });
  }
}
