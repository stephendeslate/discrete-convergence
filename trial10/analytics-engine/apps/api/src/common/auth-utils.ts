import { SetMetadata } from '@nestjs/common';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/** Marks an endpoint as public — exempts from JwtAuthGuard */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** Roles decorator for RBAC enforcement */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

/** JWT payload shape */
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tenantId: string;
}

/** Express request extended with user from JWT */
export interface RequestWithUser extends Request {
  user: JwtPayload;
}

/** Parameter decorator to extract tenantId from JWT */
export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user.tenantId;
  },
);
