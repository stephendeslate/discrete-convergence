import { Controller, Post, Get, Param, Body, Request } from '@nestjs/common';
import { PhotoService } from './photo.service';

interface AuthenticatedRequest {
  user: { sub: string; companyId: string };
}

@Controller('work-orders/:workOrderId/photos')
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @Post()
  addPhoto(
    @Param('workOrderId') workOrderId: string,
    @Body() data: { url: string; caption?: string },
    @Request() req: AuthenticatedRequest,
  ) {
    return this.photoService.addPhoto(workOrderId, req.user.companyId, data);
  }

  @Get()
  getPhotos(
    @Param('workOrderId') workOrderId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.photoService.getPhotos(workOrderId, req.user.companyId);
  }
}
