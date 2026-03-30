// TRACED: FD-DSP-004
import { Controller, Get, Post, Put, Delete, Body, Param, Req, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { DispatchService } from './dispatch.service';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { UpdateDispatchDto } from './dto/update-dispatch.dto';
import { RequestWithUser } from '../common/auth-utils';
import { PaginatedQuery } from '../common/paginated-query';

@Controller('dispatches')
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateDispatchDto) {
    return this.dispatchService.create(req.user.tenantId, dto);
  }

  @Get()
  async findAll(
    @Req() req: RequestWithUser,
    @Query() query: PaginatedQuery,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.dispatchService.findAll(req.user.tenantId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.dispatchService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateDispatchDto,
  ) {
    return this.dispatchService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.dispatchService.remove(req.user.tenantId, id);
  }
}
