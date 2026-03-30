// TRACED:FD-DATA-002 — Service queries against enums with @@map and @map for PostgreSQL naming
// TRACED:FD-DATA-003 — Queries benefit from @@index([tenantId]) and @@index([tenantId, status])
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { paginatedQuery } from '../common/paginated-query';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriverService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDriverDto) {
    return this.prisma.driver.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        licenseNumber: dto.licenseNumber,
        phone: dto.phone,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    return paginatedQuery(
      this.prisma.driver, { tenantId }, page, limit,
      { include: { dispatches: true } },
    );
  }

  async findOne(tenantId: string, id: string) {
    // findFirst: scope by tenantId for RLS enforcement at application level
    const driver = await this.prisma.driver.findFirst({
      where: { id, tenantId },
      include: { dispatches: true },
    });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }
    return driver;
  }

  async update(tenantId: string, id: string, dto: UpdateDriverDto) {
    const driver = await this.findOne(tenantId, id);
    return this.prisma.driver.update({ where: { id: driver.id }, data: { ...dto } });
  }

  async remove(tenantId: string, id: string) {
    const driver = await this.findOne(tenantId, id);
    return this.prisma.driver.update({ where: { id: driver.id }, data: { status: 'OFF_DUTY' } });
  }
}
