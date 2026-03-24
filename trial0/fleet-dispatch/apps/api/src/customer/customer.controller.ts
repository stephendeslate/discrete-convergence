import { Controller, Get, Post, Param, Query, Body, Request } from '@nestjs/common';
import { CustomerService } from './customer.service';

interface AuthenticatedRequest {
  user: { sub: string; companyId: string };
}

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.customerService.findAll(req.user.companyId, Number(page), Number(limit));
  }

  @Get(':id')
  findById(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.customerService.findById(id, req.user.companyId);
  }

  @Get(':id/work-orders')
  getWorkOrders(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.customerService.getWorkOrders(id, req.user.companyId);
  }

  @Post()
  create(@Body() data: { name: string; email: string; phone?: string; address: string; city: string; state: string; zip: string }, @Request() req: AuthenticatedRequest) {
    return this.customerService.create(data, req.user.companyId);
  }
}
