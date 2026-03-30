import { Controller, Get, Patch, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { NotificationService } from './notification.service';
import { getUser } from '../common/auth-utils';

/**
 * Notification endpoints.
 * TRACED: FD-NOTIF-002
 */
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async findAll(@Req() req: Request) {
    const user = getUser(req);
    return this.notificationService.findAll(user.sub);
  }

  @Patch(':id/read')
  async markRead(@Req() req: Request, @Param('id') id: string) {
    const user = getUser(req);
    return this.notificationService.markRead(user.sub, id);
  }
}
