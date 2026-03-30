import { Controller, Get, Req } from '@nestjs/common';
import { RequestWithUser } from '../common/auth-utils';

// TRACED: EM-CROSS-001
@Controller('dashboards')
export class DashboardController {
  @Get()
  findAll(@Req() req: RequestWithUser) {
    return { tenantId: req.user.tenantId, dashboards: [] };
  }
}
