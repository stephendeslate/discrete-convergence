import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { MaintenanceStatus, Prisma } from '@prisma/client';
import { parsePagination } from '@fleet-dispatch/shared';

// TRACED: FD-MNT-002
@Injectable()
export class MaintenanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateMaintenanceDto) {
    return this.prisma.maintenance.create({
      data: {
        description: dto.description,
        status: (dto.status as MaintenanceStatus) ?? 'SCHEDULED',
        scheduledAt: new Date(dto.scheduledAt),
        cost: dto.cost !== undefined ? new Prisma.Decimal(dto.cost) : new Prisma.Decimal(0),
        vehicleId: dto.vehicleId,
        tenantId,
      },
      include: { vehicle: true },
    });
  }

  async findAll(tenantId: string, page?: string, pageSize?: string) {
    const pagination = parsePagination(page, pageSize);
    const [items, total] = await Promise.all([
      this.prisma.maintenance.findMany({
        where: { tenantId },
        skip: pagination.skip,
        take: pagination.take,
        include: { vehicle: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.maintenance.count({ where: { tenantId } }),
    ]);

    return { items, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(tenantId: string, id: string) {
    const maintenance = await this.prisma.maintenance.findUnique({
      where: { id },
      include: { vehicle: true },
    });

    if (!maintenance || maintenance.tenantId !== tenantId) {
      throw new NotFoundException('Maintenance record not found');
    }

    return maintenance;
  }

  async update(tenantId: string, id: string, dto: UpdateMaintenanceDto) {
    await this.findOne(tenantId, id);

    return this.prisma.maintenance.update({
      where: { id },
      data: {
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status as MaintenanceStatus }),
        ...(dto.scheduledAt !== undefined && { scheduledAt: new Date(dto.scheduledAt) }),
        ...(dto.completedAt !== undefined && { completedAt: new Date(dto.completedAt) }),
        ...(dto.cost !== undefined && { cost: new Prisma.Decimal(dto.cost) }),
      },
      include: { vehicle: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.maintenance.delete({ where: { id } });
  }
}
