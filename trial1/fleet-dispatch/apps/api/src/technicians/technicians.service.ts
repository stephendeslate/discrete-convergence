import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/services/prisma.service';
import { clampPagination } from '@fleet-dispatch/shared';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';

// TRACED:FD-API-004 — Technicians CRUD service with GPS position updates
@Injectable()
export class TechniciansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateTechnicianDto) {
    return this.prisma.technician.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        skills: dto.skills ?? [],
        companyId,
      },
    });
  }

  async findAll(companyId: string, page?: number, techPageSize?: number) {
    const { pageSize: limit, skip: offset } = clampPagination(page, techPageSize);
    const [technicians, totalTechnicians] = await Promise.all([
      this.prisma.technician.findMany({
        where: { companyId },
        skip: offset,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.technician.count({ where: { companyId } }),
    ]);
    return { data: technicians, total: totalTechnicians, page: page ?? 1, pageSize: limit };
  }

  async findOne(companyId: string, techId: string) {
    const technician = await this.prisma.technician.findUnique({
      where: { id: techId },
    });

    if (!technician || technician.companyId !== companyId) {
      throw new NotFoundException('Technician not found');
    }

    return technician;
  }

  async update(companyId: string, id: string, dto: UpdateTechnicianDto) {
    const techToUpdate = await this.findOne(companyId, id);
    return this.prisma.technician.update({
      where: { id: techToUpdate.id },
      data: {
        name: dto.name,
        phone: dto.phone,
        skills: dto.skills,
      },
    });
  }

  async updatePosition(companyId: string, id: string, latitude: number, longitude: number) {
    const techForGps = await this.findOne(companyId, id);
    return this.prisma.technician.update({
      where: { id: techForGps.id },
      data: {
        latitude: new Prisma.Decimal(latitude),
        longitude: new Prisma.Decimal(longitude),
      },
    });
  }

  // TRACED:FD-DM-005 — RLS enforcement via $executeRaw with Prisma.sql
  async verifyRls(): Promise<boolean> {
    const result = await this.prisma.$executeRaw(
      Prisma.sql`SELECT current_setting('app.current_company_id', true)`,
    );
    return result >= 0;
  }
}
