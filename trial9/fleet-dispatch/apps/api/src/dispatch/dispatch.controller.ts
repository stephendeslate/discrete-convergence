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
  Header,
} from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { UpdateDispatchDto } from './dto/update-dispatch.dto';
import { RequestWithUser, Roles } from '../common/auth-utils';
import { PaginatedQueryDto } from '../common/paginated-query';

// TRACED: FD-DSP-003
@Controller('dispatches')
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() dto: CreateDispatchDto,
  ) {
    return this.dispatchService.create(req.user.tenantId, dto);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  async findAll(
    @Req() req: RequestWithUser,
    @Query() query: PaginatedQueryDto,
  ) {
    return this.dispatchService.findAll(
      req.user.tenantId,
      query.page,
      query.pageSize,
    );
  }

  @Get(':id')
  async findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.dispatchService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateDispatchDto,
  ) {
    return this.dispatchService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.dispatchService.remove(req.user.tenantId, id);
  }
}
