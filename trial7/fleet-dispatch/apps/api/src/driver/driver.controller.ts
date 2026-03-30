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
import { DriverService } from './driver.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Roles } from '../common/roles.decorator';
import { PaginatedQueryDto } from '../common/paginated-query';

// TRACED:FD-DRV-004
@Controller('drivers')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Roles('ADMIN', 'DISPATCHER')
  @Post()
  async create(@Body() dto: CreateDriverDto) {
    return this.driverService.create(dto);
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query() query: PaginatedQueryDto,
  ) {
    const user = req.user as { tenantId: string };
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.driverService.findAll(
      user.tenantId,
      query.page ? parseInt(query.page, 10) : undefined,
      query.pageSize ? parseInt(query.pageSize, 10) : undefined,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { tenantId: string };
    return this.driverService.findOne(id, user.tenantId);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDriverDto,
    @Req() req: Request,
  ) {
    const user = req.user as { tenantId: string };
    return this.driverService.update(id, user.tenantId, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { tenantId: string };
    return this.driverService.remove(id, user.tenantId);
  }
}
