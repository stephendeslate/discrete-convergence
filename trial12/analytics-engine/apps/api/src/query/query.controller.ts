import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryService } from './query.service';
import { CreateQueryDto } from './dto/create-query.dto';
import { RequestWithUser } from '../common/request-with-user';
import { PaginatedQueryDto } from '../common/paginated-query';

// TRACED: AE-QUERY-003
@Controller('queries')
export class QueryController {
  constructor(private readonly queryService: QueryService) {}

  @Post()
  create(@Body() dto: CreateQueryDto, @Req() req: RequestWithUser) {
    return this.queryService.create(dto, req.user.tenantId);
  }

  @Get()
  async findAll(
    @Query() query: PaginatedQueryDto,
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader('Cache-Control', 'private, max-age=30');
    return this.queryService.findAll(
      req.user.tenantId,
      query.page,
      query.limit,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.queryService.findOne(id, req.user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.queryService.remove(id, req.user.tenantId);
  }
}
