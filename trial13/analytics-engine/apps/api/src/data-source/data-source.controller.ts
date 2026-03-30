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
} from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { PaginatedQueryDto } from '../common/paginated-query';
import { Roles } from '../common/roles.decorator';
import { RequestWithUser } from '../common/request-with-user';

// TRACED: AE-API-007
@Controller('data-sources')
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateDataSourceDto, @Req() req: RequestWithUser) {
    return this.dataSourceService.create(dto, req.user.tenantId);
  }

  @Get()
  findAll(@Query() query: PaginatedQueryDto, @Req() req: RequestWithUser) {
    return this.dataSourceService.findAll(
      req.user.tenantId,
      query.page,
      query.pageSize,
    );
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
  async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    await this.dataSourceService.remove(id, req.user.tenantId);
  }
}
