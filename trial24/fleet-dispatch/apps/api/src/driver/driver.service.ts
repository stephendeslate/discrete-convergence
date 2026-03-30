// TRACED:API-DRIVER-SERVICE
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.module';
import { buildPaginatedResponse, buildSkipTake } from '../common/pagination.utils';
import { CreateDriverDto, UpdateDriverDto } from './dto';
import type { PaginatedResult } from '@fleet-dispatch/shared';
import type { Driver } from '@prisma/client';

@Injectable()
export class DriverService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string, page: number, limit: number): Promise<PaginatedResult<Driver>> {
    await this.prisma.setCompanyId(companyId);
    const { skip, take } = buildSkipTake(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.driver.findMany({
        where: { companyId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.driver.count({ where: { companyId } }),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string, companyId: string): Promise<Driver> {
    await this.prisma.setCompanyId(companyId);
    // tenant-scoped query
    const driver = await this.prisma.driver.findFirst({
      where: { id, companyId },
    });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }
    return driver;
  }

  async create(dto: CreateDriverDto, companyId: string): Promise<Driver> {
    await this.prisma.setCompanyId(companyId);
    return this.prisma.driver.create({
      data: { ...dto, companyId },
    });
  }

  async update(id: string, dto: UpdateDriverDto, companyId: string): Promise<Driver> {
    await this.findOne(id, companyId);
    return this.prisma.driver.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, companyId: string): Promise<Driver> {
    await this.findOne(id, companyId);
    return this.prisma.driver.update({
      where: { id },
      data: { status: 'OFF_DUTY' },
    });
  }
}
