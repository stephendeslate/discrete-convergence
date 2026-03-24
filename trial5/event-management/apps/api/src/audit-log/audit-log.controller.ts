// TRACED:EM-API-012 — AuditLogController read-only with tenant-scoped access
import { Controller, Get, Query, Request } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';

@Controller('audit-logs')
@Roles('ADMIN')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async findAll(
    @Query() query: PaginatedQueryDto,
    @Query('entity') entity: string | undefined,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.auditLogService.findAll(req.user.tenantId, {
      ...query,
      entity,
    });
  }
}
