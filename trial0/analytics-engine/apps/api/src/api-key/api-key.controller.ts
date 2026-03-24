import { Controller, Get, Post, Delete, Body, Param, Request } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

@Controller('api-keys')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  async create(
    @Body() dto: CreateApiKeyDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.apiKeyService.create(dto, req.user.tenantId);
  }

  @Get()
  async findAll(@Request() req: { user: { tenantId: string } }) {
    return this.apiKeyService.findAll(req.user.tenantId);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.apiKeyService.remove(id, req.user.tenantId);
  }
}
