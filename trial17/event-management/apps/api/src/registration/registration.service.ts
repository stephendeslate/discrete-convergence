// TRACED: EM-REG-001
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { getPaginationParams } from '../common/pagination.utils';
import { RegistrationStatus } from '@prisma/client';

@Injectable()
export class RegistrationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateRegistrationDto) {
    return this.prisma.registration.create({
      data: {
        eventId: dto.eventId,
        attendeeId: dto.attendeeId,
        status: (dto.status as RegistrationStatus) ?? RegistrationStatus.PENDING,
        tenantId,
      },
      include: { event: true, attendee: true },
    });
  }

  async findAll(tenantId: string, page?: number, pageSize?: number) {
    const params = getPaginationParams(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.registration.findMany({
        where: { tenantId },
        include: { event: true, attendee: true },
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.registration.count({ where: { tenantId } }),
    ]);
    return {
      data,
      total,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(total / params.pageSize),
    };
  }

  async findOne(tenantId: string, id: string) {
    // findFirst used because we need to scope by both id and tenantId for tenant isolation
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
        status: dto.status as RegistrationStatus | undefined,
      },
      include: { event: true, attendee: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.registration.delete({ where: { id } });
  }
}
