import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Header,
} from '@nestjs/common';
import { TechniciansService } from './technicians.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { CompanyId } from '../common/decorators/company-id.decorator';
import { PaginationParams, PaginationInput } from '../common/decorators/pagination-params.decorator';

@Controller('technicians')
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Post()
  async create(@CompanyId() companyId: string, @Body() dto: CreateTechnicianDto) {
    return this.techniciansService.create(companyId, dto);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  async findAll(@CompanyId() companyId: string, @PaginationParams() pageOpts: PaginationInput) {
    return this.techniciansService.findAll(companyId, pageOpts.page, pageOpts.pageSize);
  }

  @Get(':id')
  async findOne(@CompanyId() companyId: string, @Param('id') techId: string) {
    return this.techniciansService.findOne(companyId, techId);
  }

  @Patch(':id')
  async update(@CompanyId() companyId: string, @Param('id') id: string, @Body() dto: UpdateTechnicianDto) {
    return this.techniciansService.update(companyId, id, dto);
  }

  @Patch(':id/position')
  async updatePosition(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body('latitude') latitude: number,
    @Body('longitude') longitude: number,
  ) {
    return this.techniciansService.updatePosition(companyId, id, latitude, longitude);
  }
}
