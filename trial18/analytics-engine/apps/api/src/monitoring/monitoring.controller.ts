import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { MonitoringService } from './monitoring.service';
import { Public } from '../auth/public.decorator';

// TRACED: AE-MON-006 — MonitoringController marks all methods @Public and @SkipThrottle (system-wide monitoring)
// TRACED: AE-INFRA-002 — Monitoring controller health endpoints are @Public and @SkipThrottle

@Controller('health')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Public()
  @SkipThrottle()
  @Get()
  health() {
    return this.monitoringService.getHealth();
  }

  @Public()
  @SkipThrottle()
  @Get('ready')
  ready() {
    return this.monitoringService.getReady();
  }

  @Public()
  @SkipThrottle()
  @Get('metrics')
  metrics() {
    return this.monitoringService.getMetrics();
  }
}
