import { Controller, Get, Query, Req, UseInterceptors } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { PaginatedQueryDto } from '../common/paginated-query';
import { RequestWithUser } from '../common/request-with-user';
import { CacheControlInterceptor } from '../common/cache-control.interceptor';
import { Roles } from '../common/roles.decorator';

// TRACED: EM-AUDIT-002
@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Roles('ADMIN')
  @Get()
  @UseInterceptors(CacheControlInterceptor)
  findAll(@Req() req: RequestWithUser, @Query() query: PaginatedQueryDto) {
    return this.auditLogService.findAll(req.user.tenantId, query);
  }
}
