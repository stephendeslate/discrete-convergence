import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { SyncHistoryService } from './sync-history.service';
import { PaginatedQueryDto } from '../common/paginated-query';

@Controller('data-sources/:dataSourceId/sync-history')
export class SyncHistoryController {
  constructor(private readonly syncHistoryService: SyncHistoryService) {}

  @Get()
  async findAll(
    @Req() req: Request,
    @Param('dataSourceId') dataSourceId: string,
    @Query() query: PaginatedQueryDto,
  ) {
    const user = req.user as { tenantId: string };
    return this.syncHistoryService.findByDataSource(
      user.tenantId,
      dataSourceId,
      query.page,
      query.pageSize,
    );
  }
}
