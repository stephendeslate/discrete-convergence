import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { parsePagination } from '@fleet-dispatch/shared';
import { Prisma } from '@prisma/client';
import { VehicleStatus } from '@prisma/client';

// TRACED: FD-VEH-001
@Injectable()
export class VehicleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateVehicleDto) {
    return this.prisma.vehicle.create({
      data: {
        name: dto.name,
        licensePlate: dto.licensePlate,
        make: dto.make,
        model: dto.model,
        year: dto.year,
        status: (dto.status as VehicleStatus) ?? 'available',
        mileage: dto.mileage ?? 0,
        costPerMile: dto.costPerMile ? new Prisma.Decimal(dto.costPerMile) : new Prisma.Decimal(0),
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const pagination = parsePagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where: { tenantId },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicle.count({ where: { tenantId } }),
    ]);

    return {
      data,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize),
    };
  }

  async findOne(tenantId: string, id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
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
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.licensePlate !== undefined && { licensePlate: dto.licensePlate }),
        ...(dto.make !== undefined && { make: dto.make }),
        ...(dto.model !== undefined && { model: dto.model }),
        ...(dto.year !== undefined && { year: dto.year }),
        ...(dto.status !== undefined && { status: dto.status as VehicleStatus }),
        ...(dto.mileage !== undefined && { mileage: dto.mileage }),
        ...(dto.costPerMile !== undefined && {
          costPerMile: new Prisma.Decimal(dto.costPerMile),
        }),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.vehicle.delete({ where: { id } });
  }
}
