// TRACED:FD-DSP-007 — Dispatch controller with state transition endpoints
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { DispatchService } from './dispatch.service';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { TenantGuard, AuthenticatedUser } from '../common/tenant.guard';

@Controller('dispatches')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Get()
  findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as AuthenticatedUser;
    return this.dispatchService.findAll(user.tenantId, {
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.dispatchService.findOne(id, user.tenantId);
  }

  @Post()
  create(@Body() dto: CreateDispatchDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.dispatchService.dispatch(dto, user.tenantId, user.userId);
  }

  @Patch(':id/assign')
  assign(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.dispatchService.assign(id, user.tenantId, user.userId);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.dispatchService.complete(id, user.tenantId, user.userId);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.dispatchService.cancel(id, user.tenantId, user.userId);
  }
}
