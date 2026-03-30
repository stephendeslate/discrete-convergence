import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { clampPagination, getPaginationSkip } from '@repo/shared';
import { RegistrationStatus } from '@prisma/client';

// TRACED: EM-REG-001
@Injectable()
export class RegistrationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: { page?: number; limit?: number }) {
    const pagination = clampPagination(query);
    const skip = getPaginationSkip(pagination);
    const [data, total] = await Promise.all([
      this.prisma.registration.findMany({
        where: { tenantId }, skip, take: pagination.limit,
        include: { event: true, user: true, attendee: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.registration.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, limit: pagination.limit };
  }

  async findOne(id: string, tenantId: string) {
    const reg = await this.prisma.registration.findUnique({
      where: { id }, include: { event: true, user: true, attendee: true },
    });
    if (!reg || reg.tenantId !== tenantId) throw new NotFoundException('Registration not found');
    return reg;
  }

  async create(tenantId: string, dto: CreateRegistrationDto) {
    return this.prisma.registration.create({
      data: {
        eventId: dto.eventId,
        userId: dto.userId,
        attendeeId: dto.attendeeId,
        status: (dto.status as RegistrationStatus) ?? RegistrationStatus.PENDING,
        tenantId,
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateRegistrationDto) {
    await this.findOne(id, tenantId);
    return this.prisma.registration.update({
      where: { id },
      data: { ...(dto.status !== undefined && { status: dto.status as RegistrationStatus }) },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.registration.delete({ where: { id } });
  }
}
