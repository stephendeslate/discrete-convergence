// TRACED:EM-SES-001 TRACED:EM-SES-002 TRACED:EM-SES-003 TRACED:EM-SES-004
import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { SessionService } from './session.service';
import { CreateSessionDto, UpdateSessionDto } from './session.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { TenantGuard } from '../common/tenant.guard';
import { getAuthUser } from '../common/auth-utils';

@Controller('sessions')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  async findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = getAuthUser(req);
    return this.sessionService.findAll(user.tenantId, query);
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateSessionDto) {
    const user = getAuthUser(req);
    return this.sessionService.create(dto, user.tenantId, user.userId);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = getAuthUser(req);
    return this.sessionService.findOne(id, user.tenantId);
  }

  @Put(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateSessionDto) {
    const user = getAuthUser(req);
    return this.sessionService.update(id, dto, user.tenantId, user.userId);
  }

  @Patch(':id/confirm')
  async confirm(@Req() req: Request, @Param('id') id: string) {
    const user = getAuthUser(req);
    return this.sessionService.confirmSession(id, user.tenantId, user.userId);
  }

  @Patch(':id/cancel')
  async cancel(@Req() req: Request, @Param('id') id: string) {
    const user = getAuthUser(req);
    return this.sessionService.cancelSession(id, user.tenantId, user.userId);
  }
}
