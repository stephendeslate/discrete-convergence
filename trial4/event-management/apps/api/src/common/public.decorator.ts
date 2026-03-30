// TRACED:EM-CROSS-004 — @Public() decorator exempts routes from global JwtAuthGuard
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
