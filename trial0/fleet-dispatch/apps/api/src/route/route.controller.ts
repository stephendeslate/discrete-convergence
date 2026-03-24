import { Controller, Post, Get, Patch, Param, Body, Query, Request } from '@nestjs/common';
import { RouteService } from './route.service';

interface AuthenticatedRequest {
  user: { sub: string; companyId: string };
}

@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post('optimize')
  optimize(
    @Body() body: { technicianId: string; workOrderIds: string[] },
    @Request() req: AuthenticatedRequest,
  ) {
    return this.routeService.optimize(body.technicianId, body.workOrderIds, req.user.companyId);
  }

  @Get('technician/:technicianId')
  findByTechnician(
    @Param('technicianId') technicianId: string,
    @Query('date') date: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.routeService.findByTechnicianAndDate(technicianId, new Date(date), req.user.companyId);
  }

  @Patch(':id/reorder')
  reorder(
    @Param('id') id: string,
    @Body('stopIds') stopIds: string[],
    @Request() req: AuthenticatedRequest,
  ) {
    return this.routeService.reorder(id, stopIds, req.user.companyId);
  }
}
