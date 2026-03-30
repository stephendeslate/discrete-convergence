// TRACED:API-DISPATCH-SERVICE
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.module';
import { buildPaginatedResponse, buildSkipTake } from '../common/pagination.utils';
import { CreateDispatchDto, UpdateDispatchDto } from './dto';
import type { PaginatedResult } from '@fleet-dispatch/shared';
import type { Dispatch } from '@prisma/client';

@Injectable()
export class DispatchService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string, page: number, limit: number): Promise<PaginatedResult<Dispatch>> {
    await this.prisma.setCompanyId(companyId);
    const { skip, take } = buildSkipTake(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.dispatch.findMany({
        where: { companyId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { vehicle: true, driver: true, route: true },
      }),
      this.prisma.dispatch.count({ where: { companyId } }),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string, companyId: string): Promise<Dispatch> {
    await this.prisma.setCompanyId(companyId);
    // tenant-scoped query
    const dispatch = await this.prisma.dispatch.findFirst({
      where: { id, companyId },
      include: { vehicle: true, driver: true, route: true },
    });
    if (!dispatch) {
      throw new NotFoundException('Dispatch not found');
    }
    return dispatch;
  }

  async create(dto: CreateDispatchDto, companyId: string): Promise<Dispatch> {
    await this.prisma.setCompanyId(companyId);

    // Validate vehicle exists and is active
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: dto.vehicleId, companyId },
    });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
    if (vehicle.status !== 'ACTIVE') {
      throw new BadRequestException('Vehicle must be ACTIVE to be dispatched');
    }

    // Validate driver exists and is available
    const driver = await this.prisma.driver.findFirst({
      where: { id: dto.driverId, companyId },
    });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }
    if (driver.status !== 'AVAILABLE') {
      throw new BadRequestException('Driver must be AVAILABLE to be dispatched');
    }

    // Validate route exists
    const route = await this.prisma.route.findFirst({
      where: { id: dto.routeId, companyId },
    });
    if (!route) {
      throw new NotFoundException('Route not found');
    }

    return this.prisma.dispatch.create({
      data: {
        vehicleId: dto.vehicleId,
        driverId: dto.driverId,
        routeId: dto.routeId,
        scheduledAt: new Date(dto.scheduledAt),
        status: dto.status ?? 'PENDING',
        companyId,
      },
    });
  }

  async update(id: string, dto: UpdateDispatchDto, companyId: string): Promise<Dispatch> {
    const existing = await this.findOne(id, companyId);

    if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
      throw new BadRequestException('Cannot update a completed or cancelled dispatch');
    }

    const data: Record<string, unknown> = {};
    if (dto.vehicleId !== undefined) data.vehicleId = dto.vehicleId;
    if (dto.driverId !== undefined) data.driverId = dto.driverId;
    if (dto.routeId !== undefined) data.routeId = dto.routeId;
    if (dto.scheduledAt !== undefined) data.scheduledAt = new Date(dto.scheduledAt);
    if (dto.status !== undefined) data.status = dto.status;

    return this.prisma.dispatch.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, companyId: string): Promise<Dispatch> {
    await this.findOne(id, companyId);
    return this.prisma.dispatch.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}
