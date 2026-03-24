import { Controller, Get, Param, Query, Request } from '@nestjs/common';
import { TechnicianService } from './technician.service';

interface AuthenticatedRequest {
  user: { sub: string; companyId: string };
}

@Controller('technicians')
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Get()
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.technicianService.findAll(req.user.companyId, Number(page), Number(limit));
  }

  @Get('available')
  findAvailable(@Request() req: AuthenticatedRequest) {
    return this.technicianService.findAvailable(req.user.companyId);
  }

  @Get(':id')
  findById(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.technicianService.findById(id, req.user.companyId);
  }

  @Get(':id/schedule')
  getSchedule(
    @Param('id') id: string,
    @Query('date') date: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.technicianService.getSchedule(id, req.user.companyId, new Date(date));
  }
}
