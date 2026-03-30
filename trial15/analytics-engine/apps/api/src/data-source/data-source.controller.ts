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
  HttpCode,
  HttpStatus,
  Header,
} from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { RequestWithUser } from '../common/request-with-user';
import { Roles } from '../auth/roles.decorator';

// TRACED: AE-API-007 — DataSourceController uses @Roles('ADMIN') on create, update, delete

@Controller('data-sources')
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateDataSourceDto, @Req() req: RequestWithUser) {
    return this.dataSourceService.create(dto, req.user.tenantId);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  findAll(@Query() query: PaginatedQueryDto, @Req() req: RequestWithUser) {
    return this.dataSourceService.findAll(req.user.tenantId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.dataSourceService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDataSourceDto,
    @Req() req: RequestWithUser,
  ) {
    return this.dataSourceService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.dataSourceService.remove(id, req.user.tenantId);
  }
}
