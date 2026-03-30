// TRACED:TENANT-GUARD
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../infra/prisma.module';

interface AuthenticatedUser {
  sub: string;
  email: string;
  role: string;
  organizationId: string;
}

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser | undefined;

    if (!user?.organizationId) {
      throw new ForbiddenException('Missing organization context');
    }

    await this.prisma.setOrganizationId(user.organizationId);
    return true;
  }
}
