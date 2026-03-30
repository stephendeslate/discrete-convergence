import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { MaintenanceType, Prisma } from '@prisma/client';
import { clampPagination } from '@fleet-dispatch/shared';

// TRACED:FD-MNT-003
@Injectable()
export class MaintenanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMaintenanceDto) {
    return this.prisma.maintenanceRecord.create({
      data: {
        tenantId: dto.tenantId,
        vehicleId: dto.vehicleId,
        type: dto.type as MaintenanceType,
        description: dto.description,
        cost: new Prisma.Decimal(dto.cost),
        performedAt: new Date(dto.performedAt),
      },
      include: { vehicle: true },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const pagination = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.maintenanceRecord.findMany({
        where: { tenantId },
        skip: pagination.skip,
        take: pagination.take,
        include: { vehicle: true },
        orderBy: { performedAt: 'desc' },
      }),
      this.prisma.maintenanceRecord.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(id: string, tenantId: string) {
    const record = await this.prisma.maintenanceRecord.findUnique({
      where: { id },
      include: { vehicle: true },
    });
    if (!record || record.tenantId !== tenantId) {
      throw new NotFoundException('Maintenance record not found');
    }
    return record;
  }

  async update(id: string, tenantId: string, dto: UpdateMaintenanceDto) {
    await this.findOne(id, tenantId);
    return this.prisma.maintenanceRecord.update({
      where: { id },
      data: {
        type: dto.type ? (dto.type as MaintenanceType) : undefined,
        description: dto.description,
        cost: dto.cost !== undefined ? new Prisma.Decimal(dto.cost) : undefined,
        performedAt: dto.performedAt ? new Date(dto.performedAt) : undefined,
      },
      include: { vehicle: true },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.maintenanceRecord.delete({ where: { id } });
  }
}
