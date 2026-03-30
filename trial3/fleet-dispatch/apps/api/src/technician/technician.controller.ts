import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Header,
} from '@nestjs/common';
import { Request } from 'express';
import { TechnicianService } from './technician.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import type { AuthenticatedUser } from '../common/auth-utils';

// TRACED:FD-TECH-002
@Controller('technicians')
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateTechnicianDto) {
    const user = req.user as AuthenticatedUser;
    return this.technicianService.create(user.companyId, dto);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as AuthenticatedUser;
    return this.technicianService.findAll(
      user.companyId,
      query.page,
      query.pageSize,
    );
  }

  @Get('available')
  @Header('Cache-Control', 'private, max-age=10')
  findAvailable(@Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.technicianService.findAvailable(user.companyId);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthenticatedUser;
    return this.technicianService.findOne(user.companyId, id);
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateTechnicianDto,
  ) {
    const user = req.user as AuthenticatedUser;
    return this.technicianService.update(user.companyId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthenticatedUser;
    return this.technicianService.remove(user.companyId, id);
  }
}
