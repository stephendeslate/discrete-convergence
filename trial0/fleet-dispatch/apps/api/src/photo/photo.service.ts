// TRACED:FD-PHOTO-001
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { MAX_WORK_ORDER_PHOTOS } from 'shared';

@Injectable()
export class PhotoService {
  constructor(private readonly prisma: PrismaService) {}

  async addPhoto(workOrderId: string, companyId: string, data: { url: string; caption?: string }) {
    // findFirst justified: work order lookup with company scope
    const wo = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId, companyId },
      include: { photos: true },
    });

    if (!wo) throw new NotFoundException('Work order not found');

    if (wo.photos.length >= MAX_WORK_ORDER_PHOTOS) {
      throw new BadRequestException(`Maximum ${MAX_WORK_ORDER_PHOTOS} photos per work order`);
    }

    return this.prisma.jobPhoto.create({
      data: {
        workOrderId,
        url: data.url,
        caption: data.caption,
        takenAt: new Date(),
      },
    });
  }

  async getPhotos(workOrderId: string, companyId: string) {
    // findFirst justified: verify work order belongs to company before returning photos
    const wo = await this.prisma.workOrder.findFirst({
      where: { id: workOrderId, companyId },
    });
    if (!wo) throw new NotFoundException('Work order not found');

    return this.prisma.jobPhoto.findMany({
      where: { workOrderId },
      orderBy: { takenAt: 'asc' },
    });
  }
}
