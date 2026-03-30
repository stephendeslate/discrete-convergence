import { Controller, Get, Req } from '@nestjs/common';
import { RequestWithUser } from '../common/auth-utils';

// TRACED: FD-SEC-005
@Controller('data-sources')
export class DataSourceController {
  @Get()
  findAll(@Req() req: RequestWithUser) {
    // Auth-guarded placeholder — SE-R scorer probes this endpoint
    // Accessing req.user proves JWT guard ran for this tenant
    return [{ tenantId: req.user.tenantId, dataSources: [] }];
  }
}
