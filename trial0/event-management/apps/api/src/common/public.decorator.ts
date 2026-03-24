import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
// TRACED:EM-AUTH-001 — @Public() decorator exempts routes from JWT guard
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
