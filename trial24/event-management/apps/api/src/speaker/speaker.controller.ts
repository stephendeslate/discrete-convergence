// TRACED:SPEAKER-CONTROLLER
import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Req, ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { SpeakerService } from './speaker.service';
import { CreateSpeakerDto, UpdateSpeakerDto } from './dto';
import { PaginatedQuery } from '../common/paginated-query';
import { TenantGuard } from '../common/tenant.guard';
import { extractUser, requireRole } from '../common/auth-utils';

@Controller('speakers')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class SpeakerController {
  constructor(private readonly speakerService: SpeakerService) {}

  @Post()
  async create(@Body() dto: CreateSpeakerDto, @Req() req: Request) {
    const user = extractUser(req);
    requireRole(user, 'ADMIN', 'EDITOR');
    return this.speakerService.create(dto, user.organizationId);
  }

  @Get()
  async findAll(@Query() query: PaginatedQuery, @Req() req: Request) {
    const user = extractUser(req);
    return this.speakerService.findAll(user.organizationId, query.page, query.pageSize);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const user = extractUser(req);
    return this.speakerService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSpeakerDto,
    @Req() req: Request,
  ) {
    const user = extractUser(req);
    requireRole(user, 'ADMIN', 'EDITOR');
    return this.speakerService.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const user = extractUser(req);
    requireRole(user, 'ADMIN');
    return this.speakerService.remove(id, user.organizationId);
  }
}
