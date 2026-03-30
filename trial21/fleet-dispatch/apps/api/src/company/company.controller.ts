import { Controller, Get, Patch, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { CompanyService } from './company.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Roles } from '../auth/roles.decorator';
import { getUser } from '../common/auth-utils';

/**
 * Company profile management endpoints.
 * TRACED: FD-COMP-002
 */
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('me')
  async getCompany(@Req() req: Request) {
    const user = getUser(req);
    return this.companyService.getCompany(user.companyId);
  }

  @Roles('ADMIN')
  @Patch('me')
  async updateCompany(@Req() req: Request, @Body() dto: UpdateCompanyDto) {
    const user = getUser(req);
    return this.companyService.updateCompany(user.companyId, dto);
  }
}
