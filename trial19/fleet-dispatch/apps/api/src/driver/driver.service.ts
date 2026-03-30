import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { DriverStatus } from '@prisma/client';
import { clampPagination, buildPaginatedResult } from '@fleet-dispatch/shared';

// TRACED: FD-DRV-001
@Injectable()
export class DriverService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const params = clampPagination(page, limit);
    const where = { tenantId };

    const [data, total] = await Promise.all([
      this.prisma.driver.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: { dispatches: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.driver.count({ where }),
    ]);

    return buildPaginatedResult(data, total, params);
  }

  async findOne(id: string, tenantId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: { dispatches: true },
    });

    if (!driver || driver.tenantId !== tenantId) {
      throw new NotFoundException('Driver not found');
    }

    return driver;
  }

  async create(tenantId: string, dto: CreateDriverDto) {
    return this.prisma.driver.create({
      data: {
        name: dto.name,
        email: dto.email,
        licenseNumber: dto.licenseNumber,
        status: dto.status as DriverStatus,
        tenantId,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateDriverDto) {
    await this.findOne(id, tenantId);

    return this.prisma.driver.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.licenseNumber !== undefined && { licenseNumber: dto.licenseNumber }),
        ...(dto.status !== undefined && { status: dto.status as DriverStatus }),
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.driver.delete({ where: { id } });
  }
}
