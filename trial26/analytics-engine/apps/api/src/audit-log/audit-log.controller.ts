import { Controller, Get, Query } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { TenantId } from '../auth/tenant.decorator';
import { PaginatedQueryDto } from '../common/paginated-query';

@Controller('audit-log')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  findAll(@TenantId() tenantId: string, @Query() query: PaginatedQueryDto) {
    return this.auditLogService.findAll(tenantId, query.page, query.limit);
  }
}
