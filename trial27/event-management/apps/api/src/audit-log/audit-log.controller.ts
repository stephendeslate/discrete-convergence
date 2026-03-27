// TRACED: EM-API-007 — AuditLog controller
import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuditLogService } from './audit-log.service';
import { AuthenticatedUser } from '../common/auth-utils';
import { Roles } from '../common/roles.decorator';

@Controller('audit-log')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Roles('ADMIN')
  @Get()
  async findAll(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const user = req.user as AuthenticatedUser;
    return this.auditLogService.findAll(user.tenantId, page, pageSize);
  }
}
