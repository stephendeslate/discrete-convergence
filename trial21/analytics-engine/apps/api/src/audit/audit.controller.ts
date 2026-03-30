import { Controller, Get, Query, Req } from '@nestjs/common';
import { AuditService } from './audit.service';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: { userId: string; tenantId: string; role: string };
}

@Controller('audit-log')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async findAll(@Req() req: AuthenticatedRequest, @Query() query: PaginatedQueryDto) {
    return this.auditService.findAll(req.user.tenantId, query.page, query.limit);
  }
}
