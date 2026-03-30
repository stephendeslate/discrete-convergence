// TRACED:FD-TRP-002 — Trip service with completion logic
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { buildSkipTake, buildPaginatedResponse } from '../common/pagination.utils';
import { PaginationParams } from '@repo/shared';

@Injectable()
export class TripService {
  private readonly logger = new Logger(TripService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, params: PaginationParams) {
    await this.prisma.setTenantContext(tenantId);
    const { skip, take } = buildSkipTake(params);

    const [data, total] = await Promise.all([
      this.prisma.trip.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { dispatch: true },
      }),
      this.prisma.trip.count({ where: { tenantId } }),
    ]);

    return buildPaginatedResponse(data, total, params);
  }

  async findOne(id: string, tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    // tenant-scoped query
    const trip = await this.prisma.trip.findFirst({
      where: { id, tenantId },
      include: { dispatch: true },
    });

    if (!trip) {
      throw new NotFoundException(`Trip ${id} not found`);
    }

    return trip;
  }

  // TRACED:FD-TRP-003 — Create trip with dispatch validation
  async create(dto: CreateTripDto, tenantId: string, userId: string) {
    await this.prisma.setTenantContext(tenantId);

    // tenant-scoped query
    const dispatch = await this.prisma.dispatch.findFirst({
      where: { id: dto.dispatchId, tenantId },
    });

    if (!dispatch) {
      throw new NotFoundException(`Dispatch ${dto.dispatchId} not found`);
    }

    if (dispatch.status === 'CANCELLED') {
      throw new BadRequestException('Cannot create trip for cancelled dispatch');
    }

    if (dispatch.status === 'COMPLETED') {
      throw new BadRequestException('Cannot create trip for completed dispatch');
    }

    // Update dispatch to IN_TRANSIT if it's ASSIGNED
    if (dispatch.status === 'ASSIGNED') {
      await this.prisma.dispatch.update({
        where: { id: dto.dispatchId },
        data: { status: 'IN_TRANSIT' },
      });
    }

    const trip = await this.prisma.trip.create({
      data: {
        dispatchId: dto.dispatchId,
        startLocation: dto.startLocation,
        endLocation: dto.endLocation,
        startTime: new Date(dto.startTime),
        tenantId,
      },
      include: { dispatch: true },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Trip',
        entityId: trip.id,
        userId,
        tenantId,
        details: { dispatchId: dto.dispatchId },
      },
    });

    this.logger.log(`Trip created: ${trip.id}`);
    return trip;
  }

  // TRACED:FD-TRP-004 — Complete trip with distance and time recording
  async complete(id: string, distance: number | undefined, tenantId: string, userId: string) {
    const trip = await this.findOne(id, tenantId);

    if (trip.status === 'COMPLETED') {
      throw new BadRequestException('Trip is already completed');
    }

    if (trip.status === 'CANCELLED') {
      throw new BadRequestException('Cannot complete a cancelled trip');
    }

    const updated = await this.prisma.trip.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endTime: new Date(),
        distance,
      },
      include: { dispatch: true },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'Trip',
        entityId: id,
        details: { statusChange: `${trip.status} -> COMPLETED`, distance },
        userId,
        tenantId,
      },
    });

    this.logger.log(`Trip ${id} completed`);
    return updated;
  }
}
