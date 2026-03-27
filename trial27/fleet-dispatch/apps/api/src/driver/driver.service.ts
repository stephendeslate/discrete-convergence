// TRACED: FD-API-003 — Driver service with tenant-scoped CRUD
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { paginate, buildPaginatedResult } from '../common/pagination.utils';

@Injectable()
export class DriverService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDriverDto) {
    // TRACED: FD-EDGE-014 — Check for duplicate driver email within tenant
    // findFirst: tenant-scoped lookup by email to prevent duplicates
    const existingEmail = await this.prisma.driver.findFirst({
      where: { tenantId, email: dto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Driver with this email already exists');
    }

    // TRACED: FD-EDGE-015 — Check for duplicate license number within tenant
    // findFirst: tenant-scoped lookup by license number to prevent duplicates
    const existingLicense = await this.prisma.driver.findFirst({
      where: { tenantId, licenseNumber: dto.licenseNumber },
    });

    if (existingLicense) {
      throw new ConflictException('Driver with this license number already exists');
    }

    return this.prisma.driver.create({
      data: {
        tenantId,
        name: dto.name,
        email: dto.email,
        licenseNumber: dto.licenseNumber,
      },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const { skip, take, page: p, pageSize: ps } = paginate(page, pageSize);

    const [data, total] = await Promise.all([
      this.prisma.driver.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.driver.count({ where: { tenantId } }),
    ]);

    return buildPaginatedResult(data, total, p, ps);
  }

  async findOne(tenantId: string, id: string) {
    // TRACED: FD-EDGE-005 — Not found returns 404
    // findFirst: tenant-scoped lookup by driver ID
    const driver = await this.prisma.driver.findFirst({
      where: { id, tenantId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    return driver;
  }

  async update(tenantId: string, id: string, dto: UpdateDriverDto) {
    await this.findOne(tenantId, id);

    if (dto.email) {
      // findFirst: tenant-scoped lookup to check email uniqueness on update
      const existing = await this.prisma.driver.findFirst({
        where: { tenantId, email: dto.email, NOT: { id } },
      });

      if (existing) {
        throw new ConflictException('Driver with this email already exists');
      }
    }

    if (dto.licenseNumber) {
      // findFirst: tenant-scoped lookup to check license uniqueness on update
      const existing = await this.prisma.driver.findFirst({
        where: { tenantId, licenseNumber: dto.licenseNumber, NOT: { id } },
      });

      if (existing) {
        throw new ConflictException('Driver with this license number already exists');
      }
    }

    return this.prisma.driver.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.driver.delete({ where: { id } });
  }
}
