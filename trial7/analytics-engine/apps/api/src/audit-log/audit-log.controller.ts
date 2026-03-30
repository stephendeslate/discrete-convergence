import { Controller, Get, Post, Body, Query, Request, Header } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { Roles } from '../common/roles.decorator';
import { Role } from '@analytics-engine/shared';
import { PaginatedQueryDto } from '../common/paginated-query';

interface AuthenticatedRequest {
  user: { id: string; tenantId: string; role: string };
}

// TRACED:AE-AUDIT-003
@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Post()
  async create(
    @Body() dto: CreateAuditLogDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.auditLogService.create(dto, req.user.id, req.user.tenantId);
  }

  @Get()
  @Roles(Role.ADMIN)
  @Header('Cache-Control', 'public, max-age=30')
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Query() query: PaginatedQueryDto,
  ) {
    return this.auditLogService.findAll(
      req.user.tenantId,
      query.page,
      query.pageSize,
    );
  }
}
