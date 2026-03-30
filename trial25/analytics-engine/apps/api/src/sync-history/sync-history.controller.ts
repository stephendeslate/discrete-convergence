// TRACED:SYNC-CTRL — Sync history controller
import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { SyncHistoryService } from './sync-history.service';
import { PaginatedQueryDto } from '../common/paginated-query';
import { TenantGuard } from '../common/tenant.guard';
import { AuthUser } from '../common/auth-utils';

/**
 * Sync history controller — read-only endpoints.
 * TRACED:AE-SH-CTRL-001 — Sync history controller
 */
@Controller('sync-histories')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class SyncHistoryController {
  constructor(private readonly syncHistoryService: SyncHistoryService) {}

  @Get()
  async findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as AuthUser;
    return this.syncHistoryService.findAll(user.tenantId, query.page, query.limit);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthUser;
    return this.syncHistoryService.findOne(id, user.tenantId);
  }
}
