import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionDto, UpdateSessionDto } from './session.dto';
import { Roles } from '../common/roles.decorator';

@Controller('events/:eventId/sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Roles('ADMIN', 'ORGANIZER')
  @Post()
  async create(
    @Param('eventId') eventId: string,
    @Body() dto: CreateSessionDto,
    @Req() req: { user: { organizationId: string } },
  ) {
    return this.sessionService.create(eventId, dto, req.user.organizationId);
  }

  @Get()
  async findAll(
    @Param('eventId') eventId: string,
    @Req() req: { user: { organizationId: string } },
  ) {
    return this.sessionService.findAll(eventId, req.user.organizationId);
  }

  @Get(':sessionId')
  async findOne(
    @Param('eventId') eventId: string,
    @Param('sessionId') sessionId: string,
    @Req() req: { user: { organizationId: string } },
  ) {
    return this.sessionService.findOne(eventId, sessionId, req.user.organizationId);
  }

  @Roles('ADMIN', 'ORGANIZER')
  @Patch(':sessionId')
  async update(
    @Param('eventId') eventId: string,
    @Param('sessionId') sessionId: string,
    @Body() dto: UpdateSessionDto,
    @Req() req: { user: { organizationId: string } },
  ) {
    return this.sessionService.update(eventId, sessionId, dto, req.user.organizationId);
  }

  @Roles('ADMIN', 'ORGANIZER')
  @Delete(':sessionId')
  async remove(
    @Param('eventId') eventId: string,
    @Param('sessionId') sessionId: string,
    @Req() req: { user: { organizationId: string } },
  ) {
    return this.sessionService.remove(eventId, sessionId, req.user.organizationId);
  }
}
