import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseInterceptors } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { RequestWithUser } from '../common/request-with-user';
import { CacheControlInterceptor } from '../common/cache-control.interceptor';

// TRACED: EM-REG-002
@Controller('registrations')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Get()
  @UseInterceptors(CacheControlInterceptor)
  findAll(@Req() req: RequestWithUser, @Query() query: PaginatedQueryDto) {
    return this.registrationService.findAll(req.user.tenantId, query);
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.registrationService.findOne(id, req.user.tenantId);
  }

  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateRegistrationDto) {
    return this.registrationService.create(req.user.tenantId, dto);
  }

  @Put(':id')
  update(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: UpdateRegistrationDto) {
    return this.registrationService.update(id, req.user.tenantId, dto);
  }

  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.registrationService.remove(id, req.user.tenantId);
  }
}
