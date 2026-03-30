// TRACED: EM-REG-001 — Registration CRUD service with event validation
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, RegistrationStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { paginatedQuery } from '../common/paginated-query';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';

@Injectable()
export class RegistrationService {
  constructor(private readonly prisma: PrismaService) {}

  async setTenantContext(tenantId: string): Promise<void> {
    await this.prisma.$executeRaw(Prisma.sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`);
  }

  async create(tenantId: string, dto: CreateRegistrationDto) {
    await this.setTenantContext(tenantId);

    // findFirst: scope by tenantId for RLS enforcement at application level
    const event = await this.prisma.event.findFirst({
      where: { id: dto.eventId, tenantId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.status !== 'PUBLISHED') {
      throw new BadRequestException('Can only register for published events');
    }

    return this.prisma.registration.create({
      data: {
        status: 'PENDING',
        eventId: dto.eventId,
        userId: dto.userId,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, page?: number, limit?: number) {
    await this.setTenantContext(tenantId);
    return paginatedQuery(
      this.prisma.registration, { tenantId }, page, limit,
      { include: { event: true, user: true } },
    );
  }

  async findOne(tenantId: string, id: string) {
    await this.setTenantContext(tenantId);
    // findFirst: scope by tenantId for RLS enforcement at application level
    const registration = await this.prisma.registration.findFirst({
      where: { id, tenantId },
      include: { event: true, user: true },
    });
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }
    return registration;
  }

  async update(tenantId: string, id: string, dto: UpdateRegistrationDto) {
    const registration = await this.findOne(tenantId, id);

    if (dto.status === 'CANCELLED' && registration.status === 'CANCELLED') {
      throw new BadRequestException('Registration is already cancelled');
    }

    return this.prisma.registration.update({
      where: { id: registration.id },
      data: {
        status: dto.status as RegistrationStatus | undefined,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const registration = await this.findOne(tenantId, id);
    return this.prisma.registration.update({
      where: { id: registration.id },
      data: { status: 'CANCELLED' },
    });
  }
}
