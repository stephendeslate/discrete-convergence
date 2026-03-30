import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';

interface AuthenticatedUser {
  userId: string;
  tenantId: string;
  role: string;
}

// TRACED:EM-CAT-004
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Roles('ADMIN', 'ORGANIZER')
  async create(@Body() dto: CreateCategoryDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.categoryService.create(dto, user.tenantId);
  }

  @Get()
  async findAll(
    @Query() query: PaginatedQueryDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as AuthenticatedUser;
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.categoryService.findAll(user.tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.categoryService.findOne(id, user.tenantId);
  }

  @Put(':id')
  @Roles('ADMIN', 'ORGANIZER')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @Req() req: Request,
  ) {
    const user = req.user as AuthenticatedUser;
    return this.categoryService.update(id, dto, user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.categoryService.remove(id, user.tenantId);
  }
}
