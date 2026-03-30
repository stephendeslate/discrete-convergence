import { Controller, Get, Put, Param, Body, Req, Sse } from '@nestjs/common';
import { EmbedService } from './embed.service';
import { UpsertEmbedDto } from './dto/upsert-embed.dto';
import { Public } from '../common/auth-utils';
import { Request } from 'express';
import { Observable, interval, map } from 'rxjs';

interface AuthenticatedRequest extends Request {
  user: { userId: string; tenantId: string; role: string };
}

interface MessageEvent {
  data: string;
}

/**
 * VERIFY: AE-EMBED-003 — embed endpoints include SSE stream
 */
@Controller('embed')
export class EmbedController {
  constructor(private readonly embedService: EmbedService) {}

  @Public()
  @Get('config/:dashboardId')
  async getConfig(@Param('dashboardId') dashboardId: string) {
    return this.embedService.getConfig(dashboardId);
  }

  @Put('config/:dashboardId')
  async upsertConfig(
    @Req() req: AuthenticatedRequest,
    @Param('dashboardId') dashboardId: string,
    @Body() dto: UpsertEmbedDto,
  ) {
    return this.embedService.upsertConfig(req.user.tenantId, dashboardId, dto.allowedOrigins, dto.theme ?? {});
  }

  @Public()
  @Sse('stream/:dashboardId') // TRACED: AE-EMBED-003
  stream(@Param('dashboardId') _dashboardId: string): Observable<MessageEvent> {
    return interval(5000).pipe(
      map((count) => ({
        data: JSON.stringify({ type: 'heartbeat', count, timestamp: new Date().toISOString() }),
      })),
    );
  }
}
