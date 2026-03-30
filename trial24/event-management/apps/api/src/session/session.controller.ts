// TRACED:SESSION-CONTROLLER
import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Req, ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { SessionService } from './session.service';
import { CreateSessionDto, UpdateSessionDto } from './dto';
import { PaginatedQuery } from '../common/paginated-query';
import { TenantGuard } from '../common/tenant.guard';
import { extractUser, requireRole } from '../common/auth-utils';

@Controller('sessions')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  async create(@Body() dto: CreateSessionDto, @Req() req: Request) {
    const user = extractUser(req);
    requireRole(user, 'ADMIN', 'EDITOR');
    return this.sessionService.create(dto, user.organizationId);
  }

  @Get()
  async findAll(@Query() query: PaginatedQuery, @Req() req: Request) {
    const user = extractUser(req);
    return this.sessionService.findAll(user.organizationId, query.page, query.pageSize);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const user = extractUser(req);
    return this.sessionService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSessionDto,
    @Req() req: Request,
  ) {
    const user = extractUser(req);
    requireRole(user, 'ADMIN', 'EDITOR');
    return this.sessionService.update(id, dto, user.organizationId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const user = extractUser(req);
    requireRole(user, 'ADMIN');
    return this.sessionService.remove(id, user.organizationId);
  }
}
