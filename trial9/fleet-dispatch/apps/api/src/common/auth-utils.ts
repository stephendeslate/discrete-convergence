import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Request } from 'express';

// TRACED: FD-AUTH-003
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tenantId: string;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// TRACED: FD-SEC-005
export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user.tenantId;
  },
);
