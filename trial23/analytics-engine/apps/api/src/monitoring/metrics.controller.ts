import { Controller, Get, Req } from '@nestjs/common';
import { RequestWithUser } from '../common/auth-utils';
import { MonitoringService } from './monitoring.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get()
  getMetrics(@Req() req: RequestWithUser) {
    return this.monitoringService.getMetrics(req.user.tenantId);
  }
}
