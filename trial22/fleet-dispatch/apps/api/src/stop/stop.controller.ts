import { Controller, Get, Post, Delete, Body, Param, Query, Req, UseInterceptors } from '@nestjs/common';
import { StopService } from './stop.service';
import { CreateStopDto } from './dto/create-stop.dto';
import { RequestWithUser } from '../common/request-with-user';
import { PaginatedQueryDto } from '../common/paginated-query';
import { CacheControlInterceptor } from '../common/cache-control.interceptor';

@Controller('stops')
export class StopController {
  constructor(private readonly stopService: StopService) {}

  @Get()
  @UseInterceptors(CacheControlInterceptor)
  findAll(@Req() req: RequestWithUser, @Query() query: PaginatedQueryDto) {
    return this.stopService.findAll(req.user.tenantId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.stopService.findOne(id, req.user.tenantId);
  }

  @Post()
  create(@Body() dto: CreateStopDto, @Req() req: RequestWithUser) {
    return this.stopService.create(dto, req.user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.stopService.remove(id, req.user.tenantId);
  }
}
