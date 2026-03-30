// TRACED:EM-SPK-001 TRACED:EM-SPK-002
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { SpeakerService } from './speaker.service';
import { CreateSpeakerDto, UpdateSpeakerDto } from './speaker.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { TenantGuard } from '../common/tenant.guard';
import { getAuthUser } from '../common/auth-utils';

@Controller('speakers')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class SpeakerController {
  constructor(private readonly speakerService: SpeakerService) {}

  @Get()
  async findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = getAuthUser(req);
    return this.speakerService.findAll(user.tenantId, query);
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateSpeakerDto) {
    const user = getAuthUser(req);
    return this.speakerService.create(dto, user.tenantId, user.userId);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = getAuthUser(req);
    return this.speakerService.findOne(id, user.tenantId);
  }

  @Put(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateSpeakerDto) {
    const user = getAuthUser(req);
    return this.speakerService.update(id, dto, user.tenantId, user.userId);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = getAuthUser(req);
    return this.speakerService.remove(id, user.tenantId, user.userId);
  }
}
