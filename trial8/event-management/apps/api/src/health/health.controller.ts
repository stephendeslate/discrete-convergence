import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { APP_VERSION } from '@event-management/shared';

// TRACED: EM-API-010 — Health check endpoint (public, no auth)
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return {
      status: 'ok',
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
    };
  }
}
