// TRACED:FD-DRIVER-001 — driver CRUD service with tenant scoping and pagination
import { Injectable, NotFoundException } from '@nestjs/common';
import type { Driver } from '@prisma/client';
import { clampPagination } from '@fleet-dispatch/shared';
import type { PaginatedResult } from '@fleet-dispatch/shared';
import { PrismaService } from '../common/services/prisma.service';
import type { CreateDriverDto } from './dto/create-driver.dto';
import type { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriverService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDriverDto, tenantId: string): Promise<Driver> {
    return this.prisma.driver.create({
      data: {
        name: dto.name,
        licenseNumber: dto.licenseNumber,
        phone: dto.phone,
        vehicleId: dto.vehicleId ?? null,
        tenantId,
      },
    });
  }

  async findAll(
    tenantId: string,
    page?: number,
    pageSize?: number,
  ): Promise<PaginatedResult<Driver>> {
    const { page: p, pageSize: ps } = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.driver.findMany({
        where: { tenantId },
        skip: (p - 1) * ps,
        take: ps,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.driver.count({ where: { tenantId } }),
    ]);
    return {
      data,
      meta: { total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) },
    };
  }

  async findOne(id: string, tenantId: string): Promise<Driver> {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
    });
    if (!driver || driver.tenantId !== tenantId) {
      throw new NotFoundException('Driver not found');
    }
    return driver;
  }

  async update(id: string, dto: UpdateDriverDto, tenantId: string): Promise<Driver> {
    await this.findOne(id, tenantId);
    return this.prisma.driver.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.licenseNumber !== undefined && { licenseNumber: dto.licenseNumber }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.available !== undefined && { available: dto.available }),
        ...(dto.vehicleId !== undefined && { vehicleId: dto.vehicleId }),
      },
    });
  }

  async remove(id: string, tenantId: string): Promise<Driver> {
    await this.findOne(id, tenantId);
    return this.prisma.driver.delete({ where: { id } });
  }
}
