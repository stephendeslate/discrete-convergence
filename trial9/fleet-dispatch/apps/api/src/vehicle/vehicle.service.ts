import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleStatus, Prisma } from '@prisma/client';
import { parsePagination } from '@fleet-dispatch/shared';

// TRACED: FD-VEH-002
@Injectable()
export class VehicleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateVehicleDto) {
    return this.prisma.vehicle.create({
      data: {
        licensePlate: dto.licensePlate,
        make: dto.make,
        model: dto.model,
        year: dto.year,
        status: (dto.status as VehicleStatus) ?? 'AVAILABLE',
        mileage: dto.mileage ?? 0,
        fuelCapacity: new Prisma.Decimal(dto.fuelCapacity),
        costPerMile: new Prisma.Decimal(dto.costPerMile),
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: string, pageSize?: string) {
    const pagination = parsePagination(page, pageSize);
    const [items, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where: { tenantId },
        skip: pagination.skip,
        take: pagination.take,
        include: { dispatches: true, maintenances: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicle.count({ where: { tenantId } }),
    ]);

    return { items, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(tenantId: string, id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { dispatches: true, maintenances: true },
    });

    if (!vehicle || vehicle.tenantId !== tenantId) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async update(tenantId: string, id: string, dto: UpdateVehicleDto) {
    await this.findOne(tenantId, id);

    return this.prisma.vehicle.update({
      where: { id },
      data: {
        ...(dto.licensePlate !== undefined && { licensePlate: dto.licensePlate }),
        ...(dto.make !== undefined && { make: dto.make }),
        ...(dto.model !== undefined && { model: dto.model }),
        ...(dto.year !== undefined && { year: dto.year }),
        ...(dto.status !== undefined && { status: dto.status as VehicleStatus }),
        ...(dto.mileage !== undefined && { mileage: dto.mileage }),
        ...(dto.fuelCapacity !== undefined && { fuelCapacity: new Prisma.Decimal(dto.fuelCapacity) }),
        ...(dto.costPerMile !== undefined && { costPerMile: new Prisma.Decimal(dto.costPerMile) }),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.vehicle.delete({ where: { id } });
  }

  // TRACED: FD-DATA-002
  async getFleetStats(tenantId: string) {
    const result = await this.prisma.$executeRaw(
      Prisma.sql`SELECT COUNT(*) FROM vehicles WHERE "tenantId" = ${tenantId}`,
    );
    return { rowsAffected: result };
  }
}
