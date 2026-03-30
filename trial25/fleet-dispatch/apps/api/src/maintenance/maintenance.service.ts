// TRACED:FD-MNT-003 — Maintenance service with status management
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { buildSkipTake, buildPaginatedResponse } from '../common/pagination.utils';
import { PaginationParams } from '@repo/shared';

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, params: PaginationParams) {
    await this.prisma.setTenantContext(tenantId);
    const { skip, take } = buildSkipTake(params);

    const [data, total] = await Promise.all([
      this.prisma.maintenance.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { vehicle: true },
      }),
      this.prisma.maintenance.count({ where: { tenantId } }),
    ]);

    return buildPaginatedResponse(data, total, params);
  }

  async findOne(id: string, tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    // tenant-scoped query
    const maintenance = await this.prisma.maintenance.findFirst({
      where: { id, tenantId },
      include: { vehicle: true },
    });

    if (!maintenance) {
      throw new NotFoundException(`Maintenance ${id} not found`);
    }

    return maintenance;
  }

  // TRACED:FD-MNT-004 — Create maintenance with vehicle status update
  async create(dto: CreateMaintenanceDto, tenantId: string, userId: string) {
    await this.prisma.setTenantContext(tenantId);

    // tenant-scoped query
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: dto.vehicleId, tenantId },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle ${dto.vehicleId} not found`);
    }

    // For emergency maintenance, set vehicle to MAINTENANCE status
    if (dto.type === 'EMERGENCY') {
      await this.prisma.vehicle.update({
        where: { id: dto.vehicleId },
        data: { status: 'MAINTENANCE' },
      });
    }

    const maintenance = await this.prisma.maintenance.create({
      data: {
        vehicleId: dto.vehicleId,
        type: dto.type,
        description: dto.description,
        scheduledDate: new Date(dto.scheduledDate),
        cost: dto.cost,
        tenantId,
      },
      include: { vehicle: true },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Maintenance',
        entityId: maintenance.id,
        userId,
        tenantId,
        details: { type: dto.type, vehicleId: dto.vehicleId },
      },
    });

    this.logger.log(`Maintenance created: ${maintenance.id}`);
    return maintenance;
  }

  async update(id: string, dto: UpdateMaintenanceDto, tenantId: string, userId: string) {
    const existing = await this.findOne(id, tenantId);

    if (existing.status === 'COMPLETED') {
      throw new BadRequestException('Cannot update completed maintenance');
    }

    if (existing.status === 'CANCELLED') {
      throw new BadRequestException('Cannot update cancelled maintenance');
    }

    const maintenance = await this.prisma.maintenance.update({
      where: { id },
      data: {
        ...dto,
        scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined,
      },
      include: { vehicle: true },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'Maintenance',
        entityId: id,
        userId,
        tenantId,
      },
    });

    return maintenance;
  }

  // TRACED:FD-MNT-005 — Complete maintenance with vehicle status restoration
  async complete(id: string, tenantId: string, userId: string) {
    const maintenance = await this.findOne(id, tenantId);

    if (maintenance.status === 'COMPLETED') {
      throw new BadRequestException('Maintenance is already completed');
    }

    if (maintenance.status === 'CANCELLED') {
      throw new BadRequestException('Cannot complete cancelled maintenance');
    }

    // Restore vehicle status to ACTIVE if it was in MAINTENANCE
    // tenant-scoped query
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: maintenance.vehicleId, tenantId },
    });

    if (vehicle && vehicle.status === 'MAINTENANCE') {
      await this.prisma.vehicle.update({
        where: { id: maintenance.vehicleId },
        data: { status: 'ACTIVE' },
      });
    }

    const updated = await this.prisma.maintenance.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedDate: new Date(),
      },
      include: { vehicle: true },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'Maintenance',
        entityId: id,
        details: { statusChange: `${maintenance.status} -> COMPLETED` },
        userId,
        tenantId,
      },
    });

    this.logger.log(`Maintenance ${id} completed`);
    return updated;
  }
}
