// TRACED:EM-NOT-001
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import {
  getPaginationParams,
  buildPaginatedResult,
  PaginatedResult,
} from '../common/pagination.utils';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    organizationId: string,
    query: { page?: number; limit?: number },
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const { skip, take, page, limit } = getPaginationParams(query);

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { organizationId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { organizationId } }),
    ]);

    return buildPaginatedResult(
      data as unknown as Record<string, unknown>[],
      total,
      page,
      limit,
    );
  }

  async broadcast(
    eventId: string,
    dto: CreateNotificationDto,
    organizationId: string,
  ): Promise<Record<string, unknown>> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || event.organizationId !== organizationId) {
      throw new NotFoundException('Event not found');
    }

    const registrations = await this.prisma.registration.findMany({
      where: {
        eventId,
        status: { in: ['CONFIRMED', 'CHECKED_IN'] },
      },
      include: { user: { select: { email: true } } },
    });

    const notifications = await this.prisma.notification.createMany({
      data: registrations.map((reg) => ({
        subject: dto.subject,
        body: dto.body,
        recipientEmail: reg.user.email,
        organizationId,
        status: 'QUEUED' as const,
      })),
    });

    return {
      eventId,
      recipientCount: notifications.count,
      subject: dto.subject,
    };
  }
}
