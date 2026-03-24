// TRACED:AE-KEY-001 — API key service with hash storage
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { randomBytes, createHash } from 'crypto';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

@Injectable()
export class ApiKeyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateApiKeyDto, tenantId: string) {
    const rawKey = randomBytes(32).toString('hex');
    const prefix = rawKey.substring(0, 8);
    const keyHash = createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await this.prisma.apiKey.create({
      data: {
        name: dto.name,
        prefix,
        keyHash,
        keyType: dto.keyType,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        tenantId,
      },
    });

    return { ...apiKey, rawKey };
  }

  async findAll(tenantId: string) {
    return this.prisma.apiKey.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string, tenantId: string) {
    // findFirst: scope deletion by tenantId for multi-tenant safety
    const key = await this.prisma.apiKey.findFirst({
      where: { id, tenantId },
    });
    if (!key) {
      throw new NotFoundException('API key not found');
    }
    return this.prisma.apiKey.delete({ where: { id } });
  }
}
