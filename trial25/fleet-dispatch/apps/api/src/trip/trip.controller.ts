// TRACED:FD-TRP-005 — Trip controller
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
import { TripService } from './trip.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { TenantGuard, AuthenticatedUser } from '../common/tenant.guard';

@Controller('trips')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Get()
  findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as AuthenticatedUser;
    return this.tripService.findAll(user.tenantId, {
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.tripService.findOne(id, user.tenantId);
  }

  @Post()
  create(@Body() dto: CreateTripDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.tripService.create(dto, user.tenantId, user.userId);
  }

  @Patch(':id/complete')
  complete(
    @Param('id') id: string,
    @Body() body: { distance?: number },
    @Req() req: Request,
  ) {
    const user = req.user as AuthenticatedUser;
    return this.tripService.complete(id, body.distance, user.tenantId, user.userId);
  }
}
