import { Controller, Get, Req } from '@nestjs/common';
import { RequestWithUser } from '../common/auth-utils';

// TRACED: FD-CROSS-001
@Controller('dashboards')
export class DashboardController {
  @Get()
  findAll(@Req() req: RequestWithUser) {
    const _tenantId = req.user.tenantId;
    return [];
  }
}
