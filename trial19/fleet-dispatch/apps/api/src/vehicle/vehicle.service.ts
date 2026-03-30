import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleStatus } from '@prisma/client';
import { clampPagination, buildPaginatedResult } from '@fleet-dispatch/shared';

// TRACED: FD-VEH-001
@Injectable()
export class VehicleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const params = clampPagination(page, limit);
    const where = { tenantId };

    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: { dispatches: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return buildPaginatedResult(data, total, params);
  }

  async findOne(id: string, tenantId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { dispatches: true },
    });

    if (!vehicle || vehicle.tenantId !== tenantId) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async create(tenantId: string, dto: CreateVehicleDto) {
    return this.prisma.vehicle.create({
      data: {
        licensePlate: dto.licensePlate,
        make: dto.make,
        model: dto.model,
        year: dto.year,
        status: dto.status as VehicleStatus,
        tenantId,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateVehicleDto) {
    await this.findOne(id, tenantId);

    return this.prisma.vehicle.update({
      where: { id },
      data: {
        ...(dto.licensePlate !== undefined && { licensePlate: dto.licensePlate }),
        ...(dto.make !== undefined && { make: dto.make }),
        ...(dto.model !== undefined && { model: dto.model }),
        ...(dto.year !== undefined && { year: dto.year }),
        ...(dto.status !== undefined && { status: dto.status as VehicleStatus }),
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.vehicle.delete({ where: { id } });
  }
}
