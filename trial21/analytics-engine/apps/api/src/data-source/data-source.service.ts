import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { Tier } from '@prisma/client';
import { getPaginationParams, createPaginatedResult } from '../common/pagination.utils';
import { createHash } from 'crypto';

const TIER_LIMITS: Record<string, number> = {
  [Tier.FREE]: 3,
  [Tier.PRO]: 20,
  [Tier.ENTERPRISE]: Infinity,
};

/**
 * DataSource service managing CRUD and sync operations.
 * VERIFY: AE-DS-002 — data source count limited by tenant tier
 * VERIFY: AE-DS-003 — sourceHash for idempotent sync
 */
@Injectable()
export class DataSourceService {
  private readonly logger = new Logger(DataSourceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDataSourceDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const currentCount = await this.prisma.dataSource.count({ where: { tenantId } });
    const limit = TIER_LIMITS[tenant.tier] ?? 3;

    if (currentCount >= limit) {
      throw new BadRequestException(
        `Data source limit reached for ${tenant.tier} tier (max ${limit})`,
      );
    }

    const dataSource = await this.prisma.dataSource.create({
      data: {
        name: dto.name,
        type: dto.type,
        tenantId,
      },
    });

    if (dto.config) {
      const sourceHash = createHash('sha256').update(JSON.stringify(dto.config)).digest('hex');
      await this.prisma.dataSourceConfig.create({
        data: {
          dataSourceId: dataSource.id,
          encrypted: JSON.stringify(dto.config),
          sourceHash,
        },
      });
    }

    this.logger.log(`DataSource ${dataSource.id} created for tenant ${tenantId}`);
    return dataSource;
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    const { skip, take } = getPaginationParams(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.dataSource.findMany({
        where: { tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { config: true },
      }),
      this.prisma.dataSource.count({ where: { tenantId } }),
    ]);
    return createPaginatedResult(data, total, page ?? 1, take);
  }

  async findOne(tenantId: string, id: string) {
    // findFirst used here: tenant-scoped data source lookup
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id, tenantId },
      include: { config: true, fieldMappings: true, syncRuns: { take: 10, orderBy: { startedAt: 'desc' } } },
    });
    if (!dataSource) {
      throw new NotFoundException('Data source not found');
    }
    return dataSource;
  }

  async update(tenantId: string, id: string, dto: UpdateDataSourceDto) {
    await this.findOne(tenantId, id);
    return this.prisma.dataSource.update({
      where: { id },
      data: { name: dto.name },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.dataSource.delete({ where: { id } });
    this.logger.log(`DataSource ${id} deleted`);
  }

  async triggerSync(tenantId: string, id: string) {
    const dataSource = await this.findOne(tenantId, id);

    const syncRun = await this.prisma.syncRun.create({
      data: {
        dataSourceId: dataSource.id,
        status: 'RUNNING',
      },
    });

    this.logger.log(`Sync run ${syncRun.id} started for data source ${id}`);
    return syncRun;
  }

  async getSyncHistory(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.syncRun.findMany({
      where: { dataSourceId: id },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
  }
}
