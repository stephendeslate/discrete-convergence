// TRACED: FD-API-002 — Vehicle service with tenant-scoped CRUD
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { paginate, buildPaginatedResult } from '../common/pagination.utils';

@Injectable()
export class VehicleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateVehicleDto) {
    // TRACED: FD-EDGE-013 — Check for duplicate license plate within tenant
    // findFirst: tenant-scoped lookup by unique license plate
    const existing = await this.prisma.vehicle.findFirst({
      where: { tenantId, licensePlate: dto.licensePlate },
    });

    if (existing) {
      throw new ConflictException('Vehicle with this license plate already exists');
    }

    return this.prisma.vehicle.create({
      data: {
        tenantId,
        name: dto.name,
        licensePlate: dto.licensePlate,
        type: dto.type,
        mileage: dto.mileage ?? 0,
      },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const { skip, take, page: p, pageSize: ps } = paginate(page, pageSize);

    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicle.count({ where: { tenantId } }),
    ]);

    return buildPaginatedResult(data, total, p, ps);
  }

  async findOne(tenantId: string, id: string) {
    // TRACED: FD-EDGE-004 — Not found returns 404
    // findFirst: tenant-scoped lookup by vehicle ID
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, tenantId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async update(tenantId: string, id: string, dto: UpdateVehicleDto) {
    await this.findOne(tenantId, id);

    if (dto.licensePlate) {
      // TRACED: FD-EDGE-013 — Check duplicate license plate on update
      // findFirst: tenant-scoped lookup to check license plate uniqueness on update
      const existing = await this.prisma.vehicle.findFirst({
        where: {
          tenantId,
          licensePlate: dto.licensePlate,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('Vehicle with this license plate already exists');
      }
    }

    return this.prisma.vehicle.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.vehicle.delete({ where: { id } });
  }
}
