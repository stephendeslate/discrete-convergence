// TRACED:FD-DRV-003 — Driver service with status management
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { buildSkipTake, buildPaginatedResponse } from '../common/pagination.utils';
import { PaginationParams } from '@repo/shared';

@Injectable()
export class DriverService {
  private readonly logger = new Logger(DriverService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, params: PaginationParams) {
    await this.prisma.setTenantContext(tenantId);
    const { skip, take } = buildSkipTake(params);

    const [data, total] = await Promise.all([
      this.prisma.driver.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.driver.count({ where: { tenantId } }),
    ]);

    return buildPaginatedResponse(data, total, params);
  }

  async findOne(id: string, tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    // tenant-scoped query
    const driver = await this.prisma.driver.findFirst({
      where: { id, tenantId },
    });

    if (!driver) {
      throw new NotFoundException(`Driver ${id} not found`);
    }

    return driver;
  }

  async create(dto: CreateDriverDto, tenantId: string, userId: string) {
    await this.prisma.setTenantContext(tenantId);

    const driver = await this.prisma.driver.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        licenseNumber: dto.licenseNumber,
        tenantId,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Driver',
        entityId: driver.id,
        userId,
        tenantId,
        details: { name: dto.name },
      },
    });

    this.logger.log(`Driver created: ${driver.id}`);
    return driver;
  }

  async update(id: string, dto: UpdateDriverDto, tenantId: string, userId: string) {
    await this.findOne(id, tenantId);

    const driver = await this.prisma.driver.update({
      where: { id },
      data: dto,
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'Driver',
        entityId: driver.id,
        userId,
        tenantId,
      },
    });

    return driver;
  }

  async remove(id: string, tenantId: string, userId: string) {
    const driver = await this.findOne(id, tenantId);

    // TRACED:FD-DRV-004 — Cannot delete driver on active duty
    if (driver.status === 'ON_DUTY') {
      throw new BadRequestException('Cannot delete a driver who is currently on duty');
    }

    // Check for active dispatches
    const activeDispatches = await this.prisma.dispatch.count({
      where: {
        driverId: id,
        tenantId,
        status: { in: ['ASSIGNED', 'IN_TRANSIT'] },
      },
    });

    if (activeDispatches > 0) {
      throw new BadRequestException('Cannot delete driver with active dispatches');
    }

    await this.prisma.driver.delete({ where: { id } });

    await this.prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entity: 'Driver',
        entityId: id,
        userId,
        tenantId,
      },
    });

    return { deleted: true };
  }

  // TRACED:FD-DRV-005 — Update driver status with branching logic
  async updateStatus(id: string, status: string, tenantId: string, userId: string) {
    const driver = await this.findOne(id, tenantId);

    if (driver.status === status) {
      throw new BadRequestException(`Driver is already ${status}`);
    }

    if (status === 'ON_DUTY' && driver.status === 'OFF_DUTY') {
      throw new BadRequestException(
        'Off-duty drivers must be set to AVAILABLE before going ON_DUTY',
      );
    }

    const updated = await this.prisma.driver.update({
      where: { id },
      data: { status: status as 'AVAILABLE' | 'ON_DUTY' | 'OFF_DUTY' },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'Driver',
        entityId: id,
        details: { statusChange: `${driver.status} -> ${status}` },
        userId,
        tenantId,
      },
    });

    return updated;
  }
}
