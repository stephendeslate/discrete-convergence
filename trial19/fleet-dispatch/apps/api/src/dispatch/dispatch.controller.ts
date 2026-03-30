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
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { DispatchService } from './dispatch.service';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { UpdateDispatchDto } from './dto/update-dispatch.dto';
import { RequestWithUser } from '../common/auth-utils';
import { PaginatedQueryDto } from '../common/paginated-query';

// TRACED: FD-DISP-002
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
  async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.dispatchService.findOne(id, req.user.tenantId);
  }

  @Post()
  async create(@Req() req: RequestWithUser, @Body() dto: CreateDispatchDto) {
    return this.dispatchService.create(req.user.tenantId, dto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Body() dto: UpdateDispatchDto,
  ) {
    return this.dispatchService.update(id, req.user.tenantId, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.dispatchService.remove(id, req.user.tenantId);
  }
}
