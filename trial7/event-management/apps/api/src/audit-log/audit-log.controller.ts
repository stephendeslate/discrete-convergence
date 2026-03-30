import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuditLogService } from './audit-log.service';
import { CreateAuditLogDto } from './audit-log.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';

interface AuthenticatedUser {
  userId: string;
  tenantId: string;
  role: string;
}

// TRACED:EM-AUD-003
@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Post()
  async create(@Body() dto: CreateAuditLogDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.auditLogService.create(dto, user.userId, user.tenantId);
  }

  @Get()
  @Roles('ADMIN')
  async findAll(
    @Query() query: PaginatedQueryDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as AuthenticatedUser;
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.auditLogService.findAll(user.tenantId, query.page, query.pageSize);
  }
}
