import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { DriverStatus } from '@prisma/client';
import { parsePagination } from '@repo/shared';

// TRACED: FD-DRV-001
@Injectable()
export class DriverService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, limit: take } = parsePagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.driver.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.driver.count({ where: { tenantId } }),
    ]);
    return { data, total, page: page ?? 1, limit: take };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst used because we scope by both id and tenantId for tenant isolation
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
    return this.prisma.driver.create({
      data: {
        name: dto.name,
        licenseNumber: dto.licenseNumber,
        phone: dto.phone,
        status: (dto.status as DriverStatus) ?? 'AVAILABLE',
        tenantId,
      },
    });
  }

  async update(id: string, dto: UpdateDriverDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.driver.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.licenseNumber && { licenseNumber: dto.licenseNumber }),
        ...(dto.phone && { phone: dto.phone }),
        ...(dto.status && { status: dto.status as DriverStatus }),
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.driver.delete({ where: { id } });
  }
}
