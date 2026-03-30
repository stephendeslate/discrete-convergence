// TRACED:API-VEHICLE-SERVICE
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.module';
import { buildPaginatedResponse, buildSkipTake } from '../common/pagination.utils';
import { CreateVehicleDto, UpdateVehicleDto } from './dto';
import type { PaginatedResult } from '@fleet-dispatch/shared';
import type { Vehicle } from '@prisma/client';

@Injectable()
export class VehicleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string, page: number, limit: number): Promise<PaginatedResult<Vehicle>> {
    await this.prisma.setCompanyId(companyId);
    const { skip, take } = buildSkipTake(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where: { companyId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicle.count({ where: { companyId } }),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string, companyId: string): Promise<Vehicle> {
    await this.prisma.setCompanyId(companyId);
    // tenant-scoped query
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, companyId },
    });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
    return vehicle;
  }

  async create(dto: CreateVehicleDto, companyId: string): Promise<Vehicle> {
    await this.prisma.setCompanyId(companyId);
    return this.prisma.vehicle.create({
      data: {
        ...dto,
        companyId,
      },
    });
  }

  async update(id: string, dto: UpdateVehicleDto, companyId: string): Promise<Vehicle> {
    await this.findOne(id, companyId);
    return this.prisma.vehicle.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, companyId: string): Promise<Vehicle> {
    await this.findOne(id, companyId);
    return this.prisma.vehicle.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }
}
