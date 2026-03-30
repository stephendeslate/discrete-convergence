import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { RegistrationStatus } from '@prisma/client';
import { clampPagination } from '@event-management/shared';

// TRACED: EM-REG-001
// TRACED: EM-DATA-003
@Injectable()
export class RegistrationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const { skip, take } = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.registration.findMany({
        where: { tenantId },
        include: { event: true, attendee: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.registration.count({ where: { tenantId } }),
    ]);
    return { data, total, page: page ?? 1, pageSize: take };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst used because we need composite tenant+id check without unique constraint on both
    const registration = await this.prisma.registration.findFirst({
      where: { id, tenantId },
      include: { event: true, attendee: true },
    });
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }
    return registration;
  }

  async create(dto: CreateRegistrationDto, tenantId: string) {
    return this.prisma.registration.create({
      data: {
        eventId: dto.eventId,
        attendeeId: dto.attendeeId,
        status: (dto.status as RegistrationStatus) ?? RegistrationStatus.PENDING,
        tenantId,
      },
    });
  }

  async update(id: string, dto: UpdateRegistrationDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.registration.update({
      where: { id },
      data: {
        ...(dto.status !== undefined && { status: dto.status as RegistrationStatus }),
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.registration.delete({ where: { id } });
  }
}
