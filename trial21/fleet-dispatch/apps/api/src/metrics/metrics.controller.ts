import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { MetricsService } from './metrics.service';
import { Public } from '../auth/public.decorator';
import { getUser } from '../common/auth-utils';

/**
 * Metrics endpoint for monitoring.
 * TRACED: FD-MON-006
 */
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Public()
  @Get()
  async getMetrics(@Req() req: Request) {
    // Metrics is public but if user is authenticated, scope to tenant
    try {
      const user = getUser(req);
      return this.metricsService.getMetrics(user.tenantId);
    } catch {
      return { status: 'ok', timestamp: new Date().toISOString() };
    }
  }
}
