import { Controller, Get, Post, Delete, Param, Body, Req } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: { userId: string; tenantId: string; role: string };
}

@Controller('api-keys')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateApiKeyDto) {
    return this.apiKeyService.create(req.user.tenantId, dto);
  }

  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    return this.apiKeyService.findAll(req.user.tenantId);
  }

  @Delete(':id')
  async revoke(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.apiKeyService.revoke(req.user.tenantId, id);
  }
}
