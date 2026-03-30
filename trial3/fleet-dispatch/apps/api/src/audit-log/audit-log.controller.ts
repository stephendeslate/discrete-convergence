import {
  Controller,
  Get,
  Query,
  Req,
  Header,
} from '@nestjs/common';
import { Request } from 'express';
import { AuditLogService } from './audit-log.service';
import { PaginatedQueryDto } from '../common/paginated-query';
import type { AuthenticatedUser } from '../common/auth-utils';

// TRACED:FD-AUDIT-002
@Controller('audit-log')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as AuthenticatedUser;
    return this.auditLogService.findAll(
      user.companyId,
      query.page,
      query.pageSize,
    );
  }
}
