// TRACED:AUDIT-CTRL — Audit log controller
import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuditLogService } from './audit-log.service';
import { PaginatedQueryDto } from '../common/paginated-query';
import { TenantGuard } from '../common/tenant.guard';
import { AuthUser } from '../common/auth-utils';

/**
 * Audit log controller — read-only.
 * TRACED:AE-AL-CTRL-001 — Audit log controller
 */
@Controller('audit-logs')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as AuthUser;
    return this.auditLogService.findAll(user.tenantId, query.page, query.limit);
  }
}
