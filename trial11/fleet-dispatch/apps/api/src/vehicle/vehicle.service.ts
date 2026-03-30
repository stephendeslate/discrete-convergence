import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { getPagination } from '../common/pagination.utils';
import { Prisma } from '@prisma/client';

// TRACED: FD-API-001
@Injectable()
export class VehicleService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateVehicleDto) {
    return this.prisma.vehicle.create({
      data: {
        name: dto.name,
        licensePlate: dto.licensePlate,
        status: dto.status,
        mileage: dto.mileage ?? 0,
        tenantId,
      },
    });
  }

  // TRACED: FD-PERF-006
  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const pagination = getPagination(page, pageSize);
    return this.prisma.vehicle.findMany({
      where: { tenantId },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    // findFirst justified: querying by both id and tenantId for tenant isolation;
    // findUnique only works with @unique fields, and we need composite filtering
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, tenantId },
      include: { dispatches: true },
    });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
    return vehicle;
  }

  async update(tenantId: string, id: string, dto: UpdateVehicleDto) {
    await this.findOne(tenantId, id);
    return this.prisma.vehicle.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.vehicle.delete({ where: { id } });
  }

  // TRACED: FD-SEC-017
  async executeRawTenantCount(tenantId: string): Promise<number> {
    const result = await this.prisma.$executeRaw(
      Prisma.sql`SELECT COUNT(*) FROM vehicles WHERE tenant_id = ${tenantId}`,
    );
    return result;
  }
}
