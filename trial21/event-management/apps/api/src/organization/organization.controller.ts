import { Controller, Get, Patch, Body, Req } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { UpdateOrganizationDto } from './organization.dto';
import { Roles } from '../common/roles.decorator';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('me')
  async findMine(@Req() req: { user: { organizationId: string } }) {
    return this.organizationService.findMine(req.user.organizationId);
  }

  @Roles('ADMIN')
  @Patch('me')
  async update(
    @Body() dto: UpdateOrganizationDto,
    @Req() req: { user: { organizationId: string } },
  ) {
    return this.organizationService.update(req.user.organizationId, dto);
  }
}
