// TRACED:AE-DATA-002 — Enum usage with @@map and @map conventions
// TRACED:AE-DATA-007 — Multi-tenant entity relationships via tenantId foreign key
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, DataSourceType } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { paginatedQuery } from '../common/paginated-query';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';

@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async setTenantContext(tenantId: string): Promise<void> {
    await this.prisma.$executeRaw(Prisma.sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`);
  }

  async create(tenantId: string, dto: CreateDataSourceDto) {
    await this.setTenantContext(tenantId);
    return this.prisma.dataSource.create({
      data: {
        name: dto.name,
        type: dto.type as DataSourceType,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    await this.setTenantContext(tenantId);
    return paginatedQuery(this.prisma.dataSource, { tenantId }, page, limit);
  }

  async findOne(tenantId: string, id: string) {
    await this.setTenantContext(tenantId);
    // findFirst: scope by tenantId for multi-tenant data isolation
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
    });
    if (!dataSource) {
      throw new NotFoundException('Data source not found');
    }
    return dataSource;
  }

  async update(tenantId: string, id: string, dto: UpdateDataSourceDto) {
    const dataSource = await this.findOne(tenantId, id);
    return this.prisma.dataSource.update({ where: { id: dataSource.id }, data: { ...dto } });
  }

  async remove(tenantId: string, id: string) {
    const dataSource = await this.findOne(tenantId, id);
    return this.prisma.dataSource.delete({ where: { id: dataSource.id } });
  }
}
