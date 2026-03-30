import { Controller, Get, Post, Body } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../common/public.decorator';
import { LoggerService } from '../infra/logger.service';
import { sanitizeLogContext } from '@fleet-dispatch/shared';

@Controller()
export class MonitoringController {
  constructor(private readonly logger: LoggerService) {}

  @Public()
  @SkipThrottle()
  @Get('metrics')
  async metrics() {
    return {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Post('errors')
  async reportError(@Body() body: Record<string, unknown>) {
    const sanitized = sanitizeLogContext(body);
    this.logger.error(`Frontend error: ${JSON.stringify(sanitized)}`, undefined, 'FrontendError');
    return { received: true };
  }
}
