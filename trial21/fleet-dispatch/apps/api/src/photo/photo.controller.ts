import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { PhotoService } from './photo.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { getUser } from '../common/auth-utils';

/**
 * Photo management for work orders.
 * TRACED: FD-PHOTO-002
 */
@Controller('work-orders/:workOrderId/photos')
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @Post()
  async create(
    @Req() req: Request,
    @Param('workOrderId') workOrderId: string,
    @Body() dto: CreatePhotoDto,
  ) {
    const user = getUser(req);
    return this.photoService.create(user.tenantId, workOrderId, user.sub, dto);
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Param('workOrderId') workOrderId: string,
  ) {
    const user = getUser(req);
    return this.photoService.findByWorkOrder(user.tenantId, workOrderId);
  }
}
