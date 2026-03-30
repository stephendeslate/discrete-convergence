import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { Roles } from '../common/roles.decorator';
import { PaginatedQueryDto } from '../common/paginated-query';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';

@Controller('technicians')
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Roles('ADMIN', 'DISPATCHER')
  @Post()
  create(
    @Request() req: { user: { companyId: string } },
    @Body() dto: CreateTechnicianDto,
  ) {
    return this.technicianService.create(req.user.companyId, dto);
  }

  @Get()
  findAll(
    @Request() req: { user: { companyId: string } },
    @Query() query: PaginatedQueryDto,
  ) {
    return this.technicianService.findAll(req.user.companyId, query.page, query.limit);
  }

  @Get(':id')
  findOne(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
  ) {
    return this.technicianService.findOne(req.user.companyId, id);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Put(':id')
  update(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateTechnicianDto,
  ) {
    return this.technicianService.update(req.user.companyId, id, dto);
  }

  @Roles('ADMIN', 'DISPATCHER')
  @Delete(':id')
  remove(
    @Request() req: { user: { companyId: string } },
    @Param('id') id: string,
  ) {
    return this.technicianService.remove(req.user.companyId, id);
  }
}
