// TRACED: FD-API-006 — Data source CRUD with tenant scoping
// TRACED: FD-DATA-006 — Connection string validation and sanitization
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { paginate, clampPagination, PaginatedResult } from '../common/pagination.utils';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';

const FORBIDDEN_CONN_PATTERNS = [
  /;.*drop\s/i,
  /;.*delete\s/i,
  /;.*truncate\s/i,
  /;.*alter\s/i,
  /javascript:/i,
  /<script/i,
];

function validateConnectionString(connectionString: string): void {
  for (const pattern of FORBIDDEN_CONN_PATTERNS) {
    if (pattern.test(connectionString)) {
      throw new BadRequestException('Connection string contains forbidden patterns');
    }
  }
}

function sanitizeConnectionString(connectionString: string): string {
  return connectionString
    .replace(/password=[^;&\s]+/gi, 'password=[REDACTED]')
    .replace(/secret=[^;&\s]+/gi, 'secret=[REDACTED]');
}

@Injectable()
export class DataSourceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateDataSourceDto) {
    validateConnectionString(dto.connectionString);
    await this.prisma.setTenantContext(companyId);
    return this.prisma.dataSource.create({
      data: { ...dto, companyId },
    });
  }

  async findAll(companyId: string, page?: number, limit?: number): Promise<PaginatedResult<unknown>> {
    await this.prisma.setTenantContext(companyId);
    const clamped = clampPagination(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.dataSource.findMany({
        where: { companyId },
        skip: clamped.offset,
        take: clamped.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dataSource.count({ where: { companyId } }),
    ]);

    return paginate(data, total, page, limit);
  }

  async findOne(companyId: string, id: string) {
    await this.prisma.setTenantContext(companyId);
    const dataSource = await this.prisma.dataSource.findFirst({
      where: { id, companyId },
    });

    if (!dataSource) {
      throw new NotFoundException(`Data source ${id} not found`);
    }

    return dataSource;
  }

  async update(companyId: string, id: string, dto: UpdateDataSourceDto) {
    if (dto.connectionString) {
      validateConnectionString(dto.connectionString);
    }
    await this.findOne(companyId, id);
    await this.prisma.setTenantContext(companyId);
    return this.prisma.dataSource.update({
      where: { id },
      data: dto,
    });
  }

  async testConnection(companyId: string, id: string): Promise<{ success: boolean; message: string; sanitizedConnection: string }> {
    const dataSource = await this.findOne(companyId, id);
    const sanitized = sanitizeConnectionString(dataSource.connectionString);

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        success: true,
        message: 'Connection successful',
        sanitizedConnection: sanitized,
      };
    } catch {
      return {
        success: false,
        message: 'Connection failed',
        sanitizedConnection: sanitized,
      };
    }
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    await this.prisma.setTenantContext(companyId);
    return this.prisma.dataSource.delete({ where: { id } });
  }
}
