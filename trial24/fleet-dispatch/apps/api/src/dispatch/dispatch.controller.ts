// TRACED:API-DISPATCH-CONTROLLER
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DispatchService } from './dispatch.service';
import { CreateDispatchDto, UpdateDispatchDto } from './dto';
import { PaginatedQuery } from '../common/paginated-query';
import { CurrentUser, RolesGuard, Roles } from '../common/auth-utils';
import type { JwtPayload } from '../common/auth-utils';

@Controller('dispatches')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Get()
  findAll(@Query() query: PaginatedQuery, @CurrentUser() user: JwtPayload) {
    return this.dispatchService.findAll(user.companyId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.dispatchService.findOne(id, user.companyId);
  }

  @Post()
  @Roles('ADMIN', 'EDITOR')
  create(@Body() dto: CreateDispatchDto, @CurrentUser() user: JwtPayload) {
    return this.dispatchService.create(dto, user.companyId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'EDITOR')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDispatchDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.dispatchService.update(id, dto, user.companyId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.dispatchService.remove(id, user.companyId);
  }
}
