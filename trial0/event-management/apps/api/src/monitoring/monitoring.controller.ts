// TRACED:EM-MON-011 — Monitoring endpoints exempt from auth and throttle
import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../common/public.decorator';
import { MonitoringService } from './monitoring.service';
import { MetricsService } from './metrics.service';

@Controller('monitoring')
export class MonitoringController {
  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly metricsService: MetricsService,
  ) {}

  @Public()
  @SkipThrottle()
  @Get('health')
  getHealth() {
    return this.monitoringService.getHealth();
  }

  @Public()
  @SkipThrottle()
  @Get('ready')
  async getReady() {
    return this.monitoringService.getReady();
  }

  @Public()
  @SkipThrottle()
  @Get('metrics')
  getMetrics() {
    return this.metricsService.getMetrics();
  }

  // TRACED:EM-FE-001 — Frontend error boundary POST endpoint
  @Public()
  @SkipThrottle()
  @Post('errors')
  @HttpCode(HttpStatus.CREATED)
  reportError(@Body() body: { message: string; stack?: string; url?: string }) {
    return { received: true };
  }
}
