// TRACED:METRICS-CONTROLLER — Protected metrics endpoints for operational monitoring
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class MetricsController {
  @Get('metrics')
  getMetrics(@Req() req: { user: { organizationId: string } }) {
    return { status: 'ok', organizationId: req.user.organizationId, timestamp: new Date().toISOString() };
  }

  @Get('dashboards')
  listDashboards(@Req() req: { user: { organizationId: string } }) {
    return { data: [], total: 0, organizationId: req.user.organizationId };
  }
}
