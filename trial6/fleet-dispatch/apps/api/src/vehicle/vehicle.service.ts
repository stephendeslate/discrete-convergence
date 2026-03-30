// TRACED:FD-VEH-001 — vehicle CRUD service with tenant scoping, Decimal mileage, pagination
import { Injectable, NotFoundException } from '@nestjs/common';
import type { Vehicle } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { clampPagination } from '@fleet-dispatch/shared';
import type { PaginatedResult } from '@fleet-dispatch/shared';
import { PrismaService } from '../common/services/prisma.service';
import type { CreateVehicleDto } from './dto/create-vehicle.dto';
import type { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVehicleDto, tenantId: string): Promise<Vehicle> {
    return this.prisma.vehicle.create({
      data: {
        licensePlate: dto.licensePlate,
        make: dto.make,
        model: dto.model,
        year: dto.year,
        latitude: dto.latitude != null ? new Decimal(dto.latitude) : null,
        longitude: dto.longitude != null ? new Decimal(dto.longitude) : null,
        mileage: new Decimal(dto.mileage ?? 0),
        tenantId,
      },
    });
  }

  async findAll(
    tenantId: string,
    page?: number,
    pageSize?: number,
  ): Promise<PaginatedResult<Vehicle>> {
    const { page: p, pageSize: ps } = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where: { tenantId },
        skip: (p - 1) * ps,
        take: ps,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicle.count({ where: { tenantId } }),
    ]);
    return {
      data,
      meta: { total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) },
    };
  }

  async findOne(id: string, tenantId: string): Promise<Vehicle> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });
    if (!vehicle || vehicle.tenantId !== tenantId) {
      throw new NotFoundException('Vehicle not found');
    }
    return vehicle;
  }

  async update(id: string, dto: UpdateVehicleDto, tenantId: string): Promise<Vehicle> {
    await this.findOne(id, tenantId);
    return this.prisma.vehicle.update({
      where: { id },
      data: {
        ...(dto.licensePlate !== undefined && { licensePlate: dto.licensePlate }),
        ...(dto.make !== undefined && { make: dto.make }),
        ...(dto.model !== undefined && { model: dto.model }),
        ...(dto.year !== undefined && { year: dto.year }),
        ...(dto.status !== undefined && { status: dto.status as 'AVAILABLE' | 'IN_TRANSIT' | 'MAINTENANCE' | 'RETIRED' }),
        ...(dto.latitude !== undefined && { latitude: dto.latitude != null ? new Decimal(dto.latitude) : null }),
        ...(dto.longitude !== undefined && { longitude: dto.longitude != null ? new Decimal(dto.longitude) : null }),
        ...(dto.mileage !== undefined && { mileage: new Decimal(dto.mileage) }),
      },
    });
  }

  async remove(id: string, tenantId: string): Promise<Vehicle> {
    await this.findOne(id, tenantId);
    return this.prisma.vehicle.delete({ where: { id } });
  }
}
