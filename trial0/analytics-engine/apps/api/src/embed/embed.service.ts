// TRACED:AE-EMBED-001 — Embed service for dashboard embedding configuration
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateEmbedConfigDto } from './dto/create-embed-config.dto';
import { UpdateEmbedConfigDto } from './dto/update-embed-config.dto';

@Injectable()
export class EmbedService {
  constructor(private readonly prisma: PrismaService) {}

  async getConfig(dashboardId: string, tenantId: string) {
    // findFirst: scope embed config by tenantId via dashboard ownership
    const config = await this.prisma.embedConfig.findFirst({
      where: { dashboardId, tenantId },
    });
    if (!config) {
      throw new NotFoundException('Embed config not found');
    }
    return config;
  }

  async createOrUpdate(dashboardId: string, dto: CreateEmbedConfigDto, tenantId: string) {
    return this.prisma.embedConfig.upsert({
      where: { dashboardId },
      create: {
        allowedOrigins: dto.allowedOrigins,
        isEnabled: dto.isEnabled,
        themeOverrides: dto.themeOverrides ?? {},
        dashboardId,
        tenantId,
      },
      update: {
        allowedOrigins: dto.allowedOrigins,
        isEnabled: dto.isEnabled,
        themeOverrides: dto.themeOverrides ?? {},
      },
    });
  }
}
