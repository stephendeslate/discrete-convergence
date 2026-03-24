import { Controller, Get, Put, Body, Param, Request } from '@nestjs/common';
import { EmbedService } from './embed.service';
import { CreateEmbedConfigDto } from './dto/create-embed-config.dto';
import { Public } from '../common/public.decorator';

@Controller('embed')
export class EmbedController {
  constructor(private readonly embedService: EmbedService) {}

  @Public()
  @Get(':dashboardId/config')
  async getConfig(@Param('dashboardId') dashboardId: string) {
    // Public endpoint for embed consumers — tenantId determined from dashboard
    return this.embedService.getConfig(dashboardId, '');
  }

  @Put(':dashboardId/config')
  async createOrUpdate(
    @Param('dashboardId') dashboardId: string,
    @Body() dto: CreateEmbedConfigDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.embedService.createOrUpdate(dashboardId, dto, req.user.tenantId);
  }
}
