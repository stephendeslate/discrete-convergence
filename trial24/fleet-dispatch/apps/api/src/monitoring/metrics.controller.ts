// TRACED:API-METRICS-CONTROLLER — Protected metrics endpoints for operational monitoring
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class MetricsController {
  @Get('metrics')
  getMetrics(@Req() req: { user: { companyId: string } }) {
    return { status: 'ok', companyId: req.user.companyId, timestamp: new Date().toISOString() };
  }

  @Get('dashboards')
  listDashboards(@Req() req: { user: { companyId: string } }) {
    return { data: [], total: 0, companyId: req.user.companyId };
  }
}
