import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { getSkipTake } from '../common/pagination.utils';
import { VehicleStatus, Prisma } from '@prisma/client';

// TRACED: FD-VEH-002
@Injectable()
export class VehicleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, take } = getSkipTake(page, limit);
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
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });
    if (!vehicle || vehicle.tenantId !== tenantId) {
      throw new NotFoundException('Vehicle not found');
    }
    return vehicle;
  }

  async create(dto: CreateVehicleDto, tenantId: string) {
    return this.prisma.vehicle.create({
      data: {
        name: dto.name,
        licensePlate: dto.licensePlate,
        make: dto.make,
        model: dto.model,
        year: dto.year,
        mileage: dto.mileage,
        costPerMile: dto.costPerMile,
        status: (dto.status as VehicleStatus) ?? 'AVAILABLE',
        tenantId,
      },
    });
  }

  async update(id: string, dto: UpdateVehicleDto, tenantId: string) {
    await this.findOne(id, tenantId);
    const data: Prisma.VehicleUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.licensePlate !== undefined) data.licensePlate = dto.licensePlate;
    if (dto.make !== undefined) data.make = dto.make;
    if (dto.model !== undefined) data.model = dto.model;
    if (dto.year !== undefined) data.year = dto.year;
    if (dto.mileage !== undefined) data.mileage = dto.mileage;
    if (dto.costPerMile !== undefined) data.costPerMile = dto.costPerMile;
    if (dto.status !== undefined) data.status = dto.status as VehicleStatus;
    return this.prisma.vehicle.update({ where: { id }, data });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.vehicle.delete({ where: { id } });
  }

  // TRACED: FD-DATA-002
  async executeRawTenantQuery(tenantId: string) {
    return this.prisma.$executeRaw(
      Prisma.sql`SELECT COUNT(*) FROM vehicles WHERE "tenantId" = ${tenantId}`,
    );
  }
}
