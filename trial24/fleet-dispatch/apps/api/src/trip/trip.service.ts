// TRACED:API-TRIP-SERVICE
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.module';
import { buildPaginatedResponse, buildSkipTake } from '../common/pagination.utils';
import { CreateTripDto, UpdateTripDto } from './dto';
import type { PaginatedResult } from '@fleet-dispatch/shared';
import type { Trip } from '@prisma/client';

@Injectable()
export class TripService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string, page: number, limit: number): Promise<PaginatedResult<Trip>> {
    await this.prisma.setCompanyId(companyId);
    const { skip, take } = buildSkipTake(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.trip.findMany({
        where: { companyId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { dispatch: true },
      }),
      this.prisma.trip.count({ where: { companyId } }),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string, companyId: string): Promise<Trip> {
    await this.prisma.setCompanyId(companyId);
    // tenant-scoped query
    const trip = await this.prisma.trip.findFirst({
      where: { id, companyId },
      include: { dispatch: true },
    });
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    return trip;
  }

  async create(dto: CreateTripDto, companyId: string): Promise<Trip> {
    await this.prisma.setCompanyId(companyId);

    // tenant-scoped query — validate dispatch exists
    const dispatch = await this.prisma.dispatch.findFirst({
      where: { id: dto.dispatchId, companyId },
    });
    if (!dispatch) {
      throw new NotFoundException('Dispatch not found');
    }

    return this.prisma.trip.create({
      data: {
        dispatchId: dto.dispatchId,
        startedAt: new Date(dto.startedAt),
        completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
        distanceKm: dto.distanceKm ?? null,
        fuelUsedLiters: dto.fuelUsedLiters ?? null,
        notes: dto.notes ?? null,
        companyId,
      },
    });
  }

  async update(id: string, dto: UpdateTripDto, companyId: string): Promise<Trip> {
    await this.findOne(id, companyId);

    const data: Record<string, unknown> = {};
    if (dto.completedAt !== undefined) data.completedAt = new Date(dto.completedAt);
    if (dto.distanceKm !== undefined) data.distanceKm = dto.distanceKm;
    if (dto.fuelUsedLiters !== undefined) data.fuelUsedLiters = dto.fuelUsedLiters;
    if (dto.notes !== undefined) data.notes = dto.notes;

    return this.prisma.trip.update({
      where: { id },
      data,
    });
  }
}
