import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import pino from 'pino';

const logger = pino({ name: 'photo-service' });

/**
 * Job photo upload and retrieval.
 * TRACED: FD-PHOTO-001
 */
@Injectable()
export class PhotoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, workOrderId: string, userId: string, dto: CreatePhotoDto) {
    const wo = await this.prisma.workOrder.findUnique({
      where: { id: workOrderId },
    });
    if (!wo || wo.tenantId !== tenantId) {
      throw new NotFoundException('Work order not found');
    }

    const photo = await this.prisma.jobPhoto.create({
      data: {
        workOrderId,
        url: dto.url,
        caption: dto.caption,
        uploadedBy: userId,
      },
    });
    logger.info({ photoId: photo.id }, 'Photo uploaded');
    return photo;
  }

  async findByWorkOrder(tenantId: string, workOrderId: string) {
    const wo = await this.prisma.workOrder.findUnique({
      where: { id: workOrderId },
    });
    if (!wo || wo.tenantId !== tenantId) {
      throw new NotFoundException('Work order not found');
    }
    return this.prisma.jobPhoto.findMany({
      where: { workOrderId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
