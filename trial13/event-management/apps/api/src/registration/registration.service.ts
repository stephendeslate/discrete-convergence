import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { clampPagination } from '@event-management/shared';
import { RegistrationStatus } from '@prisma/client';

// TRACED: EM-REG-001
@Injectable()
export class RegistrationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateRegistrationDto) {
    return this.prisma.registration.create({
      data: {
        eventId: dto.eventId,
        attendeeId: dto.attendeeId,
        status: (dto.status as RegistrationStatus) ?? 'PENDING',
        tenantId,
      },
      include: { event: true, attendee: true },
    });
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    const pagination = clampPagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.registration.findMany({
        where: { tenantId },
        include: { event: true, attendee: true },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.registration.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, limit: pagination.limit };
  }

  async findOne(tenantId: string, id: string) {
    // findFirst used here because we filter by both id and tenantId for tenant isolation
    const registration = await this.prisma.registration.findFirst({
      where: { id, tenantId },
      include: { event: true, attendee: true },
    });
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }
    return registration;
  }

  async update(tenantId: string, id: string, dto: UpdateRegistrationDto) {
    await this.findOne(tenantId, id);
    return this.prisma.registration.update({
      where: { id },
      data: {
        ...(dto.status !== undefined && { status: dto.status as RegistrationStatus }),
      },
      include: { event: true, attendee: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.registration.delete({ where: { id } });
  }
}
