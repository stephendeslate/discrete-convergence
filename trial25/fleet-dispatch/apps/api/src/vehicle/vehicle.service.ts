// TRACED:FD-VEH-003 — Vehicle service with status management
// TRACED:FD-VEH-INT-001 — Vehicles: list returns paginated data
// TRACED:FD-VEH-INT-002 — Vehicles: requires authentication
// TRACED:FD-VEH-INT-003 — Vehicles: create returns new vehicle
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { buildSkipTake, buildPaginatedResponse } from '../common/pagination.utils';
import { PaginationParams } from '@repo/shared';

@Injectable()
export class VehicleService {
  private readonly logger = new Logger(VehicleService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, params: PaginationParams) {
    await this.prisma.setTenantContext(tenantId);
    const { skip, take } = buildSkipTake(params);

    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicle.count({ where: { tenantId } }),
    ]);

    return buildPaginatedResponse(data, total, params);
  }

  async findOne(id: string, tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    // tenant-scoped query
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, tenantId },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle ${id} not found`);
    }

    return vehicle;
  }

  async create(dto: CreateVehicleDto, tenantId: string, userId: string) {
    await this.prisma.setTenantContext(tenantId);

    const vehicle = await this.prisma.vehicle.create({
      data: {
        name: dto.name,
        plateNumber: dto.plateNumber,
        type: dto.type,
        capacity: dto.capacity,
        tenantId,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Vehicle',
        entityId: vehicle.id,
        userId,
        tenantId,
        details: { name: dto.name },
      },
    });

    this.logger.log(`Vehicle created: ${vehicle.id}`);
    return vehicle;
  }

  async update(id: string, dto: UpdateVehicleDto, tenantId: string, userId: string) {
    await this.findOne(id, tenantId);

    const vehicle = await this.prisma.vehicle.update({
      where: { id },
      data: dto,
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'Vehicle',
        entityId: vehicle.id,
        userId,
        tenantId,
      },
    });

    return vehicle;
  }

  async remove(id: string, tenantId: string, userId: string) {
    await this.findOne(id, tenantId);

    await this.prisma.vehicle.delete({ where: { id } });

    await this.prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entity: 'Vehicle',
        entityId: id,
        userId,
        tenantId,
      },
    });

    return { deleted: true };
  }

  // TRACED:FD-VEH-004 — Activate vehicle with status branching
  async activate(id: string, tenantId: string, userId: string) {
    const vehicle = await this.findOne(id, tenantId);

    if (vehicle.status === 'ACTIVE') {
      throw new BadRequestException('Vehicle is already active');
    }

    if (vehicle.status === 'MAINTENANCE') {
      throw new BadRequestException(
        'Vehicle in maintenance cannot be activated directly. Complete maintenance first.',
      );
    }

    const updated = await this.prisma.vehicle.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'Vehicle',
        entityId: id,
        details: { statusChange: `${vehicle.status} -> ACTIVE` },
        userId,
        tenantId,
      },
    });

    this.logger.log(`Vehicle ${id} activated`);
    return updated;
  }

  // TRACED:FD-VEH-005 — Deactivate vehicle with active dispatch check
  async deactivate(id: string, tenantId: string, userId: string) {
    const vehicle = await this.findOne(id, tenantId);

    if (vehicle.status === 'INACTIVE') {
      throw new BadRequestException('Vehicle is already inactive');
    }

    // Check for active dispatches before deactivating
    const activeDispatches = await this.prisma.dispatch.count({
      where: {
        vehicleId: id,
        tenantId,
        status: { in: ['ASSIGNED', 'IN_TRANSIT'] },
      },
    });

    if (activeDispatches > 0) {
      throw new BadRequestException(
        'Cannot deactivate vehicle with active dispatches',
      );
    }

    const updated = await this.prisma.vehicle.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'Vehicle',
        entityId: id,
        details: { statusChange: `${vehicle.status} -> INACTIVE` },
        userId,
        tenantId,
      },
    });

    this.logger.log(`Vehicle ${id} deactivated`);
    return updated;
  }
}
