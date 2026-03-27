import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuditLogService } from './audit-log.service';
import { PaginatedQueryDto } from '../common/paginated-query';

@Controller('audit-log')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as { tenantId: string };
    return this.auditLogService.findAll(user.tenantId, query.page, query.pageSize);
  }
}
