// TRACED:EM-MON-007
import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { MonitoringService } from './monitoring.service';
import { Public } from '../common/public.decorator';

@Controller()
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Public()
  @SkipThrottle()
  @Get('health')
  getHealth(): Record<string, unknown> {
    return this.monitoringService.getHealth();
  }

  @Public()
  @SkipThrottle()
  @Get('health/ready')
  async getReadiness(): Promise<Record<string, unknown>> {
    return this.monitoringService.getReadiness();
  }

  @Get('metrics')
  getMetrics(): Record<string, unknown> {
    return this.monitoringService.getMetrics();
  }
}
