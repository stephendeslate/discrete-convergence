import { Controller, Get, Query, Request, Header } from '@nestjs/common';
import { AuditService } from './audit.service';

interface AuthenticatedRequest {
  user: { sub: string; companyId: string };
}

@Controller('audit-log')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Header('Cache-Control', 'private, no-cache')
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.findAll(req.user.companyId, Number(page), Number(limit));
  }
}
