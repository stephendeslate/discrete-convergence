// TRACED: FD-API-004 — Dispatch job service with tenant-scoped CRUD and state transitions
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDispatchJobDto } from './dto/create-dispatch-job.dto';
import { UpdateDispatchJobDto } from './dto/update-dispatch-job.dto';
import { AssignJobDto } from './dto/assign-job.dto';
import { paginate, buildPaginatedResult } from '../common/pagination.utils';
import { JobStatus } from '@fleet-dispatch/shared';

@Injectable()
export class DispatchJobService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDispatchJobDto) {
    // TRACED: FD-EDGE-006 — Validate vehicle belongs to tenant if provided
    if (dto.vehicleId) {
      // findFirst: tenant-scoped lookup to validate vehicle ownership
      const vehicle = await this.prisma.vehicle.findFirst({
        where: { id: dto.vehicleId, tenantId },
      });
      if (!vehicle) {
        throw new NotFoundException('Vehicle not found');
      }
    }

    // TRACED: FD-EDGE-007 — Validate driver belongs to tenant if provided
    if (dto.driverId) {
      // findFirst: tenant-scoped lookup to validate driver ownership
      const driver = await this.prisma.driver.findFirst({
        where: { id: dto.driverId, tenantId },
      });
      if (!driver) {
        throw new NotFoundException('Driver not found');
      }
    }

    return this.prisma.dispatchJob.create({
      data: {
        tenantId,
        origin: dto.origin,
        destination: dto.destination,
        vehicleId: dto.vehicleId,
        driverId: dto.driverId,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
      },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const { skip, take, page: p, pageSize: ps } = paginate(page, pageSize);

    const [data, total] = await Promise.all([
      this.prisma.dispatchJob.findMany({
        where: { tenantId },
        include: { vehicle: true, driver: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dispatchJob.count({ where: { tenantId } }),
    ]);

    return buildPaginatedResult(data, total, p, ps);
  }

  async findOne(tenantId: string, id: string) {
    // TRACED: FD-EDGE-008 — Not found returns 404
    // findFirst: tenant-scoped lookup by job ID
    const job = await this.prisma.dispatchJob.findFirst({
      where: { id, tenantId },
      include: { vehicle: true, driver: true },
    });

    if (!job) {
      throw new NotFoundException('Dispatch job not found');
    }

    return job;
  }

  async update(tenantId: string, id: string, dto: UpdateDispatchJobDto) {
    const job = await this.findOne(tenantId, id);

    // TRACED: FD-EDGE-009 — Cannot update completed or cancelled jobs
    if (job.status === JobStatus.COMPLETED || job.status === JobStatus.CANCELLED) {
      throw new BadRequestException('Cannot update a completed or cancelled job');
    }

    return this.prisma.dispatchJob.update({
      where: { id },
      data: {
        origin: dto.origin,
        destination: dto.destination,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.dispatchJob.delete({ where: { id } });
  }

  async assign(tenantId: string, id: string, dto: AssignJobDto) {
    const job = await this.findOne(tenantId, id);

    // TRACED: FD-EDGE-010 — Cannot assign to completed or cancelled jobs
    if (job.status === JobStatus.COMPLETED || job.status === JobStatus.CANCELLED) {
      throw new BadRequestException('Cannot assign resources to a completed or cancelled job');
    }

    // findFirst: tenant-scoped lookup to validate vehicle for assignment
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: dto.vehicleId, tenantId },
    });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // findFirst: tenant-scoped lookup to validate driver for assignment
    const driver = await this.prisma.driver.findFirst({
      where: { id: dto.driverId, tenantId },
    });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    return this.prisma.dispatchJob.update({
      where: { id },
      data: {
        vehicleId: dto.vehicleId,
        driverId: dto.driverId,
        status: JobStatus.IN_PROGRESS,
      },
      include: { vehicle: true, driver: true },
    });
  }

  async complete(tenantId: string, id: string) {
    const job = await this.findOne(tenantId, id);

    // TRACED: FD-EDGE-011 — Can only complete in-progress jobs
    if (job.status !== JobStatus.IN_PROGRESS) {
      throw new BadRequestException('Can only complete jobs that are in progress');
    }

    return this.prisma.dispatchJob.update({
      where: { id },
      data: {
        status: JobStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
  }

  async cancel(tenantId: string, id: string) {
    const job = await this.findOne(tenantId, id);

    // TRACED: FD-EDGE-016 — Cannot cancel already completed jobs
    if (job.status === JobStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed job');
    }

    // TRACED: FD-EDGE-017 — Cannot cancel already cancelled jobs
    if (job.status === JobStatus.CANCELLED) {
      throw new BadRequestException('Job is already cancelled');
    }

    return this.prisma.dispatchJob.update({
      where: { id },
      data: {
        status: JobStatus.CANCELLED,
      },
    });
  }
}
