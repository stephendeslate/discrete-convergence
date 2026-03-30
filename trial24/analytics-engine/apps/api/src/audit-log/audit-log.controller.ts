// TRACED:AUDIT-CONTROLLER — REST endpoints for audit logs
import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuditLogService } from './audit-log.service';
import { PaginatedQuery } from '../common/paginated-query';
import { TenantGuard } from '../common/tenant.guard';
import { extractUser } from '../common/auth-utils';
import { Request } from 'express';

@Controller('audit-logs')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  findAll(@Query() query: PaginatedQuery, @Req() req: Request) {
    const user = extractUser(req);
    return this.auditLogService.findAll(user.tenantId, query.page, query.limit);
  }
}
