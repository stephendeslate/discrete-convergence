import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { UpdateDispatchDto } from './dto/update-dispatch.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';
import { Request } from 'express';
import { JwtPayload } from '@fleet-dispatch/shared';

// TRACED: FD-DISP-002
@Controller('dispatches')
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Post()
  @Roles('admin', 'dispatcher')
  create(@Req() req: Request, @Body() dto: CreateDispatchDto) {
    const user = req.user as JwtPayload;
    return this.dispatchService.create(user.tenantId, dto);
  }

  @Get()
  findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as JwtPayload;
    return this.dispatchService.findAll(user.tenantId, query.page, query.pageSize);
  }

  @Get('stats')
  getStats(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.dispatchService.getDispatchStats(user.tenantId);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.dispatchService.findOne(user.tenantId, id);
  }

  @Put(':id')
  @Roles('admin', 'dispatcher')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateDispatchDto,
  ) {
    const user = req.user as JwtPayload;
    return this.dispatchService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.dispatchService.remove(user.tenantId, id);
  }
}
