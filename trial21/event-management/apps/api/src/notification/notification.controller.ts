import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { BroadcastNotificationDto } from './notification.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async findAll(
    @Query() query: PaginatedQueryDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.notificationService.findAll(req.user.id, query.page, query.limit);
  }

  @Roles('ADMIN', 'ORGANIZER')
  @Post('broadcast')
  async broadcast(@Body() dto: BroadcastNotificationDto) {
    return this.notificationService.broadcast(dto);
  }
}
