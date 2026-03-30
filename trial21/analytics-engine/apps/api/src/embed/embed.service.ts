import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { DashboardStatus, Prisma } from '@prisma/client';

/**
 * Embed service managing embed configurations and SSE streaming.
 * VERIFY: AE-EMBED-001 — dashboard must be PUBLISHED for embed
 * VERIFY: AE-EMBED-002 — embed config includes allowed origins for CORS
 */
@Injectable()
export class EmbedService {
  private readonly logger = new Logger(EmbedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getConfig(dashboardId: string) {
    // findFirst used here: embed config lookup by dashboard ID with status check
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id: dashboardId },
      include: { embedConfig: true },
    });

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    if (dashboard.status !== DashboardStatus.PUBLISHED) {
      throw new BadRequestException('Dashboard must be PUBLISHED for embed');
    }

    return dashboard.embedConfig;
  }

  async upsertConfig(tenantId: string, dashboardId: string, allowedOrigins: string[], theme: Record<string, unknown>) {
    // findFirst used here: tenant-scoped dashboard verification before embed config upsert
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id: dashboardId, tenantId },
    });

    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    if (dashboard.status !== DashboardStatus.PUBLISHED) {
      throw new BadRequestException('Dashboard must be PUBLISHED for embed');
    }

    const themeJson = theme as Prisma.InputJsonValue;
    const config = await this.prisma.embedConfig.upsert({
      where: { dashboardId },
      create: { dashboardId, allowedOrigins, theme: themeJson },
      update: { allowedOrigins, theme: themeJson },
    });

    this.logger.log(`Embed config updated for dashboard ${dashboardId}`);
    return config;
  }
}
