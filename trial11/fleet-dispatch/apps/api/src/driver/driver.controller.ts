import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { DriverService } from './driver.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';
import { RequestWithUser } from '../common/request-with-user';

// TRACED: FD-API-004
@Controller('drivers')
export class DriverController {
  constructor(private driverService: DriverService) {}

  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateDriverDto) {
    return this.driverService.create(req.user.tenantId, dto);
  }

  @Get()
  findAll(@Req() req: RequestWithUser, @Query() query: PaginatedQueryDto) {
    return this.driverService.findAll(req.user.tenantId, query.page, query.pageSize);
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.driverService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateDriverDto,
  ) {
    return this.driverService.update(req.user.tenantId, id, dto);
  }

  // TRACED: FD-API-012
  @Delete(':id')
  @Roles('ADMIN')
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.driverService.remove(req.user.tenantId, id);
  }
}
