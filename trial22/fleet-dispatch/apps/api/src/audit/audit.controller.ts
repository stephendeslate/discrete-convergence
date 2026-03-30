import { Controller, Get, Query, Req, UseInterceptors } from '@nestjs/common';
import { AuditService } from './audit.service';
import { RequestWithUser } from '../common/request-with-user';
import { PaginatedQueryDto } from '../common/paginated-query';
import { CacheControlInterceptor } from '../common/cache-control.interceptor';
import { Roles } from '../common/roles.decorator';

// TRACED: FD-AUDIT-002
// TRACED: FD-API-003
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Roles('ADMIN')
  @Get()
  @UseInterceptors(CacheControlInterceptor)
  findAll(@Req() req: RequestWithUser, @Query() query: PaginatedQueryDto) {
    return this.auditService.findAll(req.user.tenantId, query.page, query.limit);
  }
}
