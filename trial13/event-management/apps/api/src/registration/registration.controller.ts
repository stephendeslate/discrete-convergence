import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Request } from 'express';
import { JwtPayload } from '@event-management/shared';

// TRACED: EM-REG-002
@Controller('registrations')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateRegistrationDto) {
    const user = req.user as JwtPayload;
    return this.registrationService.create(user.tenantId, dto);
  }

  @Get()
  findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as JwtPayload;
    return this.registrationService.findAll(user.tenantId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.registrationService.findOne(user.tenantId, id);
  }

  @Put(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateRegistrationDto) {
    const user = req.user as JwtPayload;
    return this.registrationService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.registrationService.remove(user.tenantId, id);
  }
}
