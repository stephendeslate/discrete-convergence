// TRACED:FD-AUDIT-002 — audit log controller (read-only, ADMIN/DISPATCHER)
import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { AuditLogService } from './audit-log.service';

@Controller('audit-logs')
@Roles('ADMIN', 'DISPATCHER')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async findAll(
    @TenantId() tenantId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('entity') entity?: string,
  ) {
    return this.auditLogService.findAll(
      tenantId,
      page ? Number(page) : undefined,
      pageSize ? Number(pageSize) : undefined,
      entity,
    );
  }
}
