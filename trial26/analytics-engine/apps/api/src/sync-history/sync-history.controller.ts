import { Controller, Get, Param, Query } from '@nestjs/common';
import { SyncHistoryService } from './sync-history.service';
import { TenantId } from '../auth/tenant.decorator';
import { PaginatedQueryDto } from '../common/paginated-query';

@Controller()
export class SyncHistoryController {
  constructor(private readonly syncHistoryService: SyncHistoryService) {}

  @Get('data-sources/:dataSourceId/sync-history')
  findAll(
    @TenantId() tenantId: string,
    @Param('dataSourceId') dataSourceId: string,
    @Query() query: PaginatedQueryDto,
  ) {
    return this.syncHistoryService.findAllForDataSource(tenantId, dataSourceId, query.page, query.limit);
  }

  @Get('sync-history/:id')
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.syncHistoryService.findOne(tenantId, id);
  }
}
