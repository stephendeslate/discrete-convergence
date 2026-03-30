import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateGeofenceDto } from './dto/create-geofence.dto';
import { parsePagination } from '@repo/shared';

// TRACED: FD-GEO-001
@Injectable()
export class GeofenceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, limit: take } = parsePagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.geofence.findMany({ where: { tenantId }, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.geofence.count({ where: { tenantId } }),
    ]);
    return { data, total, page: page ?? 1, limit: take };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst used because we scope by both id and tenantId for tenant isolation
    const geofence = await this.prisma.geofence.findFirst({ where: { id, tenantId } });
    if (!geofence) {
      throw new NotFoundException('Geofence not found');
    }
    return geofence;
  }

  async create(dto: CreateGeofenceDto, tenantId: string) {
    return this.prisma.geofence.create({
      data: { name: dto.name, latitude: dto.latitude, longitude: dto.longitude, radius: dto.radius, tenantId },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.geofence.delete({ where: { id } });
  }
}
