import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { DispatchService } from './dispatch.service';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { UpdateDispatchDto } from './dto/update-dispatch.dto';
import { RequestWithUser } from '../common/auth-utils';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';

// TRACED: FD-DISP-003
@Controller('dispatches')
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Get()
  async findAll(
    @Req() req: RequestWithUser,
    @Query() query: PaginatedQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.dispatchService.findAll(req.user.tenantId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.dispatchService.findOne(id, req.user.tenantId);
  }

  @Post()
  create(@Body() dto: CreateDispatchDto, @Req() req: RequestWithUser) {
    return this.dispatchService.create(dto, req.user.tenantId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDispatchDto,
    @Req() req: RequestWithUser,
  ) {
    return this.dispatchService.update(id, dto, req.user.tenantId);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.dispatchService.remove(id, req.user.tenantId);
  }
}
