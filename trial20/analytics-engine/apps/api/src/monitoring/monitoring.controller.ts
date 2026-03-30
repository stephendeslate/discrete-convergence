import { Controller, Get } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { Public } from '../common/public.decorator';

// TRACED: AE-MON-007
@Controller('health')
export class HealthController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Public()
  @Get()
  getHealth() {
    return this.monitoringService.getHealth();
  }

  @Public()
  @Get('ready')
  getReady() {
    return this.monitoringService.getReady();
  }
}

// TRACED: AE-MON-008
@Controller('metrics')
export class MetricsController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Public()
  @Get()
  getMetrics() {
    return this.monitoringService.getMetrics();
  }
}
