import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseInterceptors } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { RequestWithUser } from '../common/request-with-user';
import { PaginatedQueryDto } from '../common/paginated-query';
import { CacheControlInterceptor } from '../common/cache-control.interceptor';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @UseInterceptors(CacheControlInterceptor)
  findAll(@Req() req: RequestWithUser, @Query() query: PaginatedQueryDto) {
    return this.notificationService.findAll(req.user.tenantId, query.page, query.limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.notificationService.findOne(id, req.user.tenantId);
  }

  @Post()
  create(@Body() dto: CreateNotificationDto, @Req() req: RequestWithUser) {
    return this.notificationService.create(dto, req.user.tenantId);
  }

  @Put(':id/read')
  markRead(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.notificationService.markRead(id, req.user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.notificationService.remove(id, req.user.tenantId);
  }
}
