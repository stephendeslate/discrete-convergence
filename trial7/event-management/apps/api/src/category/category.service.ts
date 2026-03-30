import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
import { clampPagination } from '@event-management/shared';

// TRACED:EM-CAT-003
@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto, tenantId: string) {
    return this.prisma.category.create({
      data: { ...dto, tenantId },
    });
  }

  async findAll(tenantId: string, page?: string, pageSize?: string) {
    const pagination = clampPagination(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where: { tenantId },
        include: { events: true },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.category.count({ where: { tenantId } }),
    ]);
    return { data, total, page: pagination.page, pageSize: pagination.pageSize };
  }

  async findOne(id: string, tenantId: string) {
    // findFirst: filtering by id + tenantId for tenant-scoped access
    const category = await this.prisma.category.findFirst({
      where: { id, tenantId },
      include: { events: true },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.category.delete({ where: { id } });
  }
}
