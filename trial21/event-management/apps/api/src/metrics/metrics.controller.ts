import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/public.decorator';

/** TRACED:EM-MON-005 — Metrics endpoint */
@Controller('metrics')
@Public()
export class MetricsController {
  @Get()
  metrics(): { uptime: number; timestamp: string } {
    return {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
