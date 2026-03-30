// TRACED:AE-MON-003 — Health and metrics endpoints with @Public() decorator
import { Controller, Get } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { Public } from '../common/public.decorator';

@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Public()
  @Get('health')
  async health() {
    return this.monitoringService.getHealth();
  }

  @Public()
  @Get('metrics')
  async metrics() {
    return this.monitoringService.getMetrics();
  }
}
