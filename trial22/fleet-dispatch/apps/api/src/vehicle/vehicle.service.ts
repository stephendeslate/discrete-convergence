import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleStatus } from '@prisma/client';
import { parsePagination } from '@repo/shared';

// TRACED: FD-VEH-001
// TRACED: FD-API-005
// TRACED: FD-EDGE-001
// TRACED: FD-EDGE-003
// TRACED: FD-EDGE-008
@Injectable()
export class VehicleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, limit: take } = parsePagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicle.count({ where: { tenantId } }),
    ]);
    return { data, total, page: page ?? 1, limit: take };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst used because we need to scope by both id and tenantId for RLS
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, tenantId },
      include: { trips: true, maintenanceRecords: true, fuelLogs: true },
    });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
    return vehicle;
  }

  async create(dto: CreateVehicleDto, tenantId: string) {
    return this.prisma.vehicle.create({
      data: {
        vin: dto.vin,
        licensePlate: dto.licensePlate,
        make: dto.make,
        model: dto.model,
        year: dto.year,
        status: (dto.status as VehicleStatus) ?? 'ACTIVE',
        mileage: dto.mileage ?? 0,
        tenantId,
      },
    });
  }

  async update(id: string, dto: UpdateVehicleDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.vehicle.update({
      where: { id },
      data: {
        ...(dto.vin && { vin: dto.vin }),
        ...(dto.licensePlate && { licensePlate: dto.licensePlate }),
        ...(dto.make && { make: dto.make }),
        ...(dto.model && { model: dto.model }),
        ...(dto.year && { year: dto.year }),
        ...(dto.status && { status: dto.status as VehicleStatus }),
        ...(dto.mileage !== undefined && { mileage: dto.mileage }),
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.vehicle.delete({ where: { id } });
  }
}
