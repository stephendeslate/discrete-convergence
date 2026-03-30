import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuditService } from './audit.service';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../auth/roles.decorator';
import { getUser } from '../common/auth-utils';

/**
 * Audit log endpoints — admin only.
 * TRACED: FD-AUDIT-002
 */
@Controller('audit-log')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Roles('ADMIN')
  @Get()
  async findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = getUser(req);
    return this.auditService.findAll(
      user.tenantId,
      query.page,
      query.limit,
    );
  }
}
