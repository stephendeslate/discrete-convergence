// TRACED:EM-REG-001
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import {
  getPaginationParams,
  buildPaginatedResult,
  PaginatedResult,
} from '../common/pagination.utils';

@Injectable()
export class RegistrationService {
  constructor(private readonly prisma: PrismaService) {}

  async register(
    eventId: string,
    dto: CreateRegistrationDto,
    userId: string,
    organizationId: string,
  ): Promise<Record<string, unknown>> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { ticketTypes: true },
    });

    if (!event || event.organizationId !== organizationId) {
      throw new NotFoundException('Event not found');
    }

    if (
      event.status !== 'REGISTRATION_OPEN' &&
      event.status !== 'PUBLISHED'
    ) {
      throw new BadRequestException('Event is not open for registration');
    }

    const ticketType = event.ticketTypes.find(
      (tt) => tt.id === dto.ticketTypeId,
    );
    if (!ticketType) {
      throw new NotFoundException('Ticket type not found');
    }

    if (ticketType.soldCount >= ticketType.quota) {
      throw new BadRequestException('Ticket type is sold out');
    }

    const registration = await this.prisma.$transaction(async (tx) => {
      await tx.ticketType.update({
        where: { id: dto.ticketTypeId },
        data: { soldCount: { increment: 1 } },
      });

      return tx.registration.create({
        data: {
          userId,
          eventId,
          ticketTypeId: dto.ticketTypeId,
          organizationId,
          status: 'CONFIRMED',
        },
        include: { event: true, ticketType: true },
      });
    });

    return registration as unknown as Record<string, unknown>;
  }

  async findAllForEvent(
    eventId: string,
    organizationId: string,
    query: { page?: number; limit?: number },
  ): Promise<PaginatedResult<Record<string, unknown>>> {
    const { skip, take, page, limit } = getPaginationParams(query);

    const [data, total] = await Promise.all([
      this.prisma.registration.findMany({
        where: { eventId, organizationId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, email: true } }, ticketType: true },
      }),
      this.prisma.registration.count({ where: { eventId, organizationId } }),
    ]);

    return buildPaginatedResult(
      data as unknown as Record<string, unknown>[],
      total,
      page,
      limit,
    );
  }

  async cancel(
    registrationId: string,
    organizationId: string,
  ): Promise<Record<string, unknown>> {
    const registration = await this.prisma.registration.findUnique({
      where: { id: registrationId },
    });

    if (!registration || registration.organizationId !== organizationId) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.status === 'CANCELLED') {
      throw new BadRequestException('Registration already cancelled');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (registration.status === 'CONFIRMED') {
        await tx.ticketType.update({
          where: { id: registration.ticketTypeId },
          data: { soldCount: { decrement: 1 } },
        });
      }

      return tx.registration.update({
        where: { id: registrationId },
        data: { status: 'CANCELLED' },
        include: { event: true, ticketType: true },
      });
    });

    return updated as unknown as Record<string, unknown>;
  }
}
