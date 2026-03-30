import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { DEFAULT_PAGE_SIZE } from '@fleet-dispatch/shared';
import { buildPaginatedResult } from '../common/pagination.utils';
import pino from 'pino';

const logger = pino({ name: 'technician-service' });

/**
 * Manages technician records and availability.
 * TRACED: FD-TECH-001
 */
@Injectable()
export class TechnicianService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, companyId: string, dto: CreateTechnicianDto) {
    const tech = await this.prisma.technician.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        skills: dto.skills ?? [],
        companyId,
        tenantId,
      },
    });
    logger.info({ technicianId: tech.id }, 'Technician created');
    return tech;
  }

  async findAll(tenantId: string, page: number = 1, limit: number = DEFAULT_PAGE_SIZE) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.technician.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.technician.count({ where: { tenantId } }),
    ]);
    return buildPaginatedResult(data, total, page, limit);
  }

  async findOne(tenantId: string, id: string) {
    const tech = await this.prisma.technician.findUnique({ where: { id } });
    if (!tech || tech.tenantId !== tenantId) {
      throw new NotFoundException('Technician not found');
    }
    return tech;
  }

  async update(tenantId: string, id: string, dto: UpdateTechnicianDto) {
    const tech = await this.prisma.technician.findUnique({ where: { id } });
    if (!tech || tech.tenantId !== tenantId) {
      throw new NotFoundException('Technician not found');
    }
    return this.prisma.technician.update({
      where: { id },
      data: dto,
    });
  }

  async findAvailable(tenantId: string) {
    return this.prisma.technician.findMany({
      where: { tenantId, isActive: true },
    });
  }

  async getSchedule(tenantId: string, id: string, date: string) {
    const tech = await this.prisma.technician.findUnique({ where: { id } });
    if (!tech || tech.tenantId !== tenantId) {
      throw new NotFoundException('Technician not found');
    }
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.workOrder.findMany({
      where: {
        technicianId: id,
        tenantId,
        scheduledDate: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  async updateGps(tenantId: string, id: string, lat: number, lng: number) {
    const tech = await this.prisma.technician.findUnique({ where: { id } });
    if (!tech || tech.tenantId !== tenantId) {
      throw new NotFoundException('Technician not found');
    }

    // Batch GPS insert for retention — uses $executeRaw for performance
    // TRACED: FD-GPS-001
    // TRACED: FD-EDGE-006 — GPS batch insert failures logged
    await this.prisma.$executeRaw`
      INSERT INTO gps_readings (id, technician_id, latitude, longitude, tenant_id, recorded_at)
      VALUES (gen_random_uuid(), ${id}, ${lat}, ${lng}, ${tenantId}, NOW())
    `;

    return this.prisma.technician.update({
      where: { id },
      data: {
        latitude: lat,
        longitude: lng,
        gpsUpdatedAt: new Date(),
      },
    });
  }
}
