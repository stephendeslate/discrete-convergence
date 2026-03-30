import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { parsePagination } from '@fleet-dispatch/shared';
import { Prisma } from '@prisma/client';
import { DriverStatus } from '@prisma/client';

// TRACED: FD-DRV-001
@Injectable()
export class DriverService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDriverDto) {
    return this.prisma.driver.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        licenseNumber: dto.licenseNumber,
        status: (dto.status as DriverStatus) ?? 'active',
        hourlyRate: dto.hourlyRate ? new Prisma.Decimal(dto.hourlyRate) : new Prisma.Decimal(0),
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const pagination = parsePagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.driver.findMany({
        where: { tenantId },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.driver.count({ where: { tenantId } }),
    ]);

    return {
      data,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize),
    };
  }

  async findOne(tenantId: string, id: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
    });

    if (!driver || driver.tenantId !== tenantId) {
      throw new NotFoundException('Driver not found');
    }

    return driver;
  }

  async update(tenantId: string, id: string, dto: UpdateDriverDto) {
    await this.findOne(tenantId, id);

    return this.prisma.driver.update({
      where: { id },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.licenseNumber !== undefined && { licenseNumber: dto.licenseNumber }),
        ...(dto.status !== undefined && { status: dto.status as DriverStatus }),
        ...(dto.hourlyRate !== undefined && {
          hourlyRate: new Prisma.Decimal(dto.hourlyRate),
        }),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.driver.delete({ where: { id } });
  }
}
