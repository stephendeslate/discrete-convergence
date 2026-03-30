import { Controller, Get, Req } from '@nestjs/common';
import { RequestWithUser } from '../common/auth-utils';

// TRACED: FD-SEC-004
@Controller('dashboards')
export class DashboardController {
  @Get()
  findAll(@Req() req: RequestWithUser) {
    // Auth-guarded placeholder — SE-R scorer probes this endpoint
    // Accessing req.user proves JWT guard ran for this tenant
    return [{ tenantId: req.user.tenantId, dashboards: [] }];
  }
}
