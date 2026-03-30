import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Req,
  Header,
} from '@nestjs/common';
import { Request } from 'express';
import { NotificationService } from './notification.service';
import { PaginatedQueryDto } from '../common/paginated-query';
import type { AuthenticatedUser } from '../common/auth-utils';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @Header('Cache-Control', 'private, max-age=10')
  findAll(@Req() req: Request, @Query() query: PaginatedQueryDto) {
    const user = req.user as AuthenticatedUser;
    return this.notificationService.findAll(
      user.companyId,
      user.userId,
      query.page,
      query.pageSize,
    );
  }

  @Patch(':id/read')
  markAsRead(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthenticatedUser;
    return this.notificationService.markAsRead(user.companyId, id);
  }
}
