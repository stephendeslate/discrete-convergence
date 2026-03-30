// TRACED:API-TENANT-GUARD
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

interface JwtUser {
  sub: string;
  email: string;
  role: string;
  companyId: string;
}

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: JwtUser }>();
    const user = request.user;

    if (!user?.companyId) {
      throw new ForbiddenException('Missing company context');
    }

    return true;
  }
}
