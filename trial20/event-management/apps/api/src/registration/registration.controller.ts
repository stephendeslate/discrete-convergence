import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, HttpCode, HttpStatus, Header } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { CreateRegistrationDto, UpdateRegistrationDto } from './dto/create-registration.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { RequestWithUser } from '../common/auth-utils';

// TRACED: EM-REG-002
@Controller('registrations')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  create(@Body() dto: CreateRegistrationDto, @Req() req: RequestWithUser) {
    return this.registrationService.create(dto, req.user.tenantId);
  }

  @Get()
  @Header('Cache-Control', 'max-age=30, public')
  findAll(@Query() query: PaginatedQueryDto, @Req() req: RequestWithUser) {
    return this.registrationService.findAll(req.user.tenantId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.registrationService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRegistrationDto, @Req() req: RequestWithUser) {
    return this.registrationService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.registrationService.remove(id, req.user.tenantId);
  }
}
