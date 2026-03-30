import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/public.decorator';
import { APP_VERSION } from '@event-management/shared';

/** TRACED:EM-INF-004 — Health controller with @Public() (no @SkipThrottle) */
@Controller('health')
@Public()
export class HealthController {
  @Get()
  health(): { status: string; version: string; timestamp: string } {
    return {
      status: 'ok',
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  ready(): { status: string } {
    return { status: 'ready' };
  }
}
