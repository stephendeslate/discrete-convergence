import { Controller, Get, Query, Request, Res } from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { AuditService } from './audit.service';

@Controller('audit-log')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async findAll(
    @Request() req: { user: { organizationId: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Res({ passthrough: true }) res?: ExpressResponse,
  ) {
    res?.setHeader('Cache-Control', 'public, max-age=30');
    return this.auditService.findAll(
      req.user.organizationId,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
  }
}
