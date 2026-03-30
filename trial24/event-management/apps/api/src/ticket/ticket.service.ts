// TRACED:TICKET-SERVICE
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.module';
import { CreateTicketDto, UpdateTicketDto } from './dto';
import { buildPaginatedResponse, getPrismaSkipTake } from '../common/pagination.utils';

@Injectable()
export class TicketService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTicketDto, organizationId: string) {
    return this.prisma.ticket.create({
      data: {
        type: dto.type,
        price: dto.price,
        quantity: dto.quantity,
        eventId: dto.eventId,
        organizationId,
      },
    });
  }

  async findAll(organizationId: string, page?: number, pageSize?: number) {
    const { skip, take } = getPrismaSkipTake(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where: { organizationId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ticket.count({ where: { organizationId } }),
    ]);
    return buildPaginatedResponse(data, total, page, pageSize);
  }

  async findOne(id: string, organizationId: string) {
    // tenant-scoped query
    const ticket = await this.prisma.ticket.findFirst({
      where: { id, organizationId },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.ticket.update({
      where: { id },
      data: {
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.quantity !== undefined && { quantity: dto.quantity }),
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    await this.prisma.ticket.delete({ where: { id } });
    return { deleted: true };
  }
}
