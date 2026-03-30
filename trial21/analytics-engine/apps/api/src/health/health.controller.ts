import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/auth-utils';
import { APP_VERSION } from '@analytics-engine/shared';

/**
 * Health check controller.
 * VERIFY: AE-INFRA-003 — health endpoint is public (no @SkipThrottle)
 * VERIFY: AE-INFRA-004 — readiness endpoint checks service dependencies
 */
@Controller('health')
export class HealthController {
  @Public() // TRACED: AE-INFRA-003
  @Get()
  check() {
    return {
      status: 'ok',
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('ready') // TRACED: AE-INFRA-004
  ready() {
    return {
      status: 'ready',
      version: APP_VERSION,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
