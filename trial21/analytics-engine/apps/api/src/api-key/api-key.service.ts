import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { createHash, randomBytes } from 'crypto';

/**
 * API Key service managing creation and revocation of API keys.
 * VERIFY: AE-APIKEY-001 — API keys are hashed before storage
 * VERIFY: AE-APIKEY-002 — API key prefix stored for identification
 */
@Injectable()
export class ApiKeyService {
  private readonly logger = new Logger(ApiKeyService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateApiKeyDto) {
    const rawKey = `ae_${randomBytes(32).toString('hex')}`;
    const prefix = rawKey.substring(0, 8);
    const keyHash = createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await this.prisma.apiKey.create({
      data: {
        name: dto.name,
        keyHash,
        prefix,
        tenantId,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });

    this.logger.log(`API key ${apiKey.id} created for tenant ${tenantId}`);

    return {
      id: apiKey.id,
      name: apiKey.name,
      key: rawKey,
      prefix: apiKey.prefix,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
    };
  }

  async findAll(tenantId: string) {
    return this.prisma.apiKey.findMany({
      where: { tenantId, revokedAt: null },
      select: { id: true, name: true, prefix: true, expiresAt: true, lastUsed: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revoke(tenantId: string, id: string) {
    // findFirst used here: tenant-scoped API key lookup for revocation
    const key = await this.prisma.apiKey.findFirst({
      where: { id, tenantId },
    });

    if (!key) {
      throw new NotFoundException('API key not found');
    }

    await this.prisma.apiKey.update({
      where: { id },
      data: { revokedAt: new Date() },
    });

    this.logger.log(`API key ${id} revoked`);
  }
}
