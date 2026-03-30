import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
import { clampPagination, getPaginationSkip } from '@repo/shared';

// TRACED: EM-TTYPE-001
@Injectable()
export class TicketTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; limit?: number }) {
    const pagination = clampPagination(query);
    const skip = getPaginationSkip(pagination);
    const [data, total] = await Promise.all([
      this.prisma.ticketType.findMany({ where: { tenantId }, skip, take: pagination.limit, include: { event: true }, orderBy: { createdAt: 'desc' } }),
      this.prisma.ticketType.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, limit: pagination.limit };
  }

  async findOne(id: string, tenantId: string) {
    const ticketType = await this.prisma.ticketType.findUnique({ where: { id }, include: { event: true } });
    if (!ticketType || ticketType.tenantId !== tenantId) throw new NotFoundException('Ticket type not found');
    return ticketType;
  }

  async create(tenantId: string, dto: CreateTicketTypeDto) {
    return this.prisma.ticketType.create({
      data: { name: dto.name, price: dto.price, quantity: dto.quantity, eventId: dto.eventId, tenantId },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateTicketTypeDto) {
    await this.findOne(id, tenantId);
    return this.prisma.ticketType.update({ where: { id }, data: dto });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.ticketType.delete({ where: { id } });
  }
}
