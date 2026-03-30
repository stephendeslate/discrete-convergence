// TRACED:EM-EVT-001
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { SponsorService } from './sponsor.service';
import { CreateSponsorDto, UpdateSponsorDto } from './sponsor.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { TenantGuard } from '../common/tenant.guard';
import { getAuthUser } from '../common/auth-utils';

@Controller('sponsors')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class SponsorController {
  constructor(private readonly sponsorService: SponsorService) {}

  @Get()
  async findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = getAuthUser(req);
    return this.sponsorService.findAll(user.tenantId, query);
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateSponsorDto) {
    const user = getAuthUser(req);
    return this.sponsorService.create(dto, user.tenantId, user.userId);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = getAuthUser(req);
    return this.sponsorService.findOne(id, user.tenantId);
  }

  @Put(':id')
  async update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateSponsorDto) {
    const user = getAuthUser(req);
    return this.sponsorService.update(id, dto, user.tenantId, user.userId);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = getAuthUser(req);
    return this.sponsorService.remove(id, user.tenantId, user.userId);
  }
}
