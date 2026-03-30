// TRACED:FD-ZNE-004 — Zone controller
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ZoneService } from './zone.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { TenantGuard, AuthenticatedUser } from '../common/tenant.guard';

@Controller('zones')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class ZoneController {
  constructor(private readonly zoneService: ZoneService) {}

  @Get()
  findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as AuthenticatedUser;
    return this.zoneService.findAll(user.tenantId, {
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.zoneService.findOne(id, user.tenantId);
  }

  @Post()
  create(@Body() dto: CreateZoneDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.zoneService.create(dto, user.tenantId, user.userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateZoneDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.zoneService.update(id, dto, user.tenantId, user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.zoneService.remove(id, user.tenantId, user.userId);
  }
}
