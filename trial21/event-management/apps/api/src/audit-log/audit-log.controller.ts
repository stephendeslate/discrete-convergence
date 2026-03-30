import { Controller, Get, Query, Req } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';

@Controller('audit-log')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Roles('ADMIN')
  @Get()
  async findAll(
    @Query() query: PaginatedQueryDto,
    @Req() req: { user: { organizationId: string } },
  ) {
    return this.auditLogService.findAll(
      req.user.organizationId,
      query.page,
      query.limit,
    );
  }
}
