import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DispatchService } from './dispatch.service';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { UpdateDispatchDto } from './dto/update-dispatch.dto';
import { Roles } from '../common/roles.decorator';
import { PaginatedQueryDto } from '../common/paginated-query';

// TRACED:FD-DSP-004
@Controller('dispatches')
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Roles('ADMIN', 'DISPATCHER')
  @Post()
  async create(@Body() dto: CreateDispatchDto, @Req() req: Request) {
    const user = req.user as { userId: string };
    return this.dispatchService.create(dto, user.userId);
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query() query: PaginatedQueryDto,
  ) {
    const user = req.user as { tenantId: string };
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.dispatchService.findAll(
      user.tenantId,
      query.page ? parseInt(query.page, 10) : undefined,
      query.pageSize ? parseInt(query.pageSize, 10) : undefined,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { tenantId: string };
    return this.dispatchService.findOne(id, user.tenantId);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDispatchDto,
    @Req() req: Request,
  ) {
    const user = req.user as { tenantId: string };
    return this.dispatchService.update(id, user.tenantId, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { tenantId: string };
    return this.dispatchService.remove(id, user.tenantId);
  }
}
