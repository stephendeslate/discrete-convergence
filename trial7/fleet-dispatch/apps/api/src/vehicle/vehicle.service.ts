import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleStatus, Prisma } from '@prisma/client';
import { clampPagination } from '@fleet-dispatch/shared';

// TRACED:FD-VEH-003
@Injectable()
export class VehicleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVehicleDto) {
    return this.prisma.vehicle.create({
      data: {
        tenantId: dto.tenantId,
        licensePlate: dto.licensePlate,
        make: dto.make,
        model: dto.model,
        year: dto.year,
        mileage: new Prisma.Decimal(dto.mileage),
        fuelCostPerKm: new Prisma.Decimal(dto.fuelCostPerKm),
      },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const pagination = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where: { tenantId },
        skip: pagination.skip,
        take: pagination.take,
        include: { dispatches: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicle.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(id: string, tenantId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { dispatches: true, maintenanceRecords: true },
    });
    if (!vehicle || vehicle.tenantId !== tenantId) {
      throw new NotFoundException('Vehicle not found');
    }
    return vehicle;
  }

  async update(id: string, tenantId: string, dto: UpdateVehicleDto) {
    await this.findOne(id, tenantId);
    return this.prisma.vehicle.update({
      where: { id },
      data: {
        ...dto,
        status: dto.status ? (dto.status as VehicleStatus) : undefined,
        mileage: dto.mileage !== undefined ? new Prisma.Decimal(dto.mileage) : undefined,
        fuelCostPerKm: dto.fuelCostPerKm !== undefined ? new Prisma.Decimal(dto.fuelCostPerKm) : undefined,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.vehicle.delete({ where: { id } });
  }
}
