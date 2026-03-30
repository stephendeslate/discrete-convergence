import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { APP_VERSION } from '@fleet-dispatch/shared';

/**
 * Monitoring endpoint for uptime checks.
 * TRACED: FD-MON-007
 */
@Controller('monitoring')
@Public()
export class MonitoringController {
  @Get()
  getStatus() {
    return {
      status: 'ok',
      version: APP_VERSION,
      uptime: process.uptime(),
    };
  }
}
