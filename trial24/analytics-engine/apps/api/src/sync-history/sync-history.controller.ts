// TRACED:SYNC-CONTROLLER — REST endpoints for sync history
import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SyncHistoryService } from './sync-history.service';
import { PaginatedQuery } from '../common/paginated-query';
import { TenantGuard } from '../common/tenant.guard';
import { extractUser } from '../common/auth-utils';
import { Request } from 'express';

@Controller('sync-histories')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class SyncHistoryController {
  constructor(private readonly syncHistoryService: SyncHistoryService) {}

  @Get('data-source/:dataSourceId')
  findByDataSource(
    @Param('dataSourceId', ParseUUIDPipe) dataSourceId: string,
    @Query() query: PaginatedQuery,
    @Req() req: Request,
  ) {
    const user = extractUser(req);
    return this.syncHistoryService.findByDataSource(
      dataSourceId,
      user.tenantId,
      query.page,
      query.limit,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const user = extractUser(req);
    return this.syncHistoryService.findOne(id, user.tenantId);
  }

  @Post('data-source/:dataSourceId/trigger')
  triggerSync(
    @Param('dataSourceId', ParseUUIDPipe) dataSourceId: string,
    @Req() req: Request,
  ) {
    const user = extractUser(req);
    return this.syncHistoryService.triggerSync(dataSourceId, user.tenantId);
  }
}
