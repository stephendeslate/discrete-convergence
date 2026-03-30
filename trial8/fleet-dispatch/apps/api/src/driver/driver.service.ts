import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { LoggerService } from '../infra/logger.service';
import { CreateDriverDto, UpdateDriverDto } from './driver.dto';
import { getPagination } from '../common/pagination.utils';

@Injectable()
export class DriverService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async findAll(tenantId: string, query: { page?: number; pageSize?: number }) {
    const { skip, take, page, pageSize } = getPagination(query);
    const where = { tenantId };

    const [data, total] = await Promise.all([
      this.prisma.driver.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.driver.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: scoped by tenantId for tenant isolation
    const driver = await this.prisma.driver.findFirst({
      where: { id, tenantId },
      include: { trips: true },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    return driver;
  }

  async create(dto: CreateDriverDto, tenantId: string) {
    const driver = await this.prisma.driver.create({
      data: {
        licenseNumber: dto.licenseNumber,
        name: dto.name,
        certifications: dto.certifications ?? [],
        tenantId,
      },
    });

    this.logger.log(`Driver ${driver.id} created`, 'DriverService');
    return driver;
  }

  async update(id: string, dto: UpdateDriverDto, tenantId: string) {
    // findFirst: scoped by tenantId before update for tenant isolation
    const existing = await this.prisma.driver.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Driver not found');
    }

    return this.prisma.driver.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.status !== undefined && { status: dto.status as 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED' }),
        ...(dto.certifications !== undefined && { certifications: dto.certifications }),
      },
    });
  }

  async delete(id: string, tenantId: string) {
    // findFirst: scoped by tenantId before delete for tenant isolation
    const existing = await this.prisma.driver.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Driver not found');
    }

    await this.prisma.driver.delete({ where: { id } });
    return { deleted: true };
  }
}
