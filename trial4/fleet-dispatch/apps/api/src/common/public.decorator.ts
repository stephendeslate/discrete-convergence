// TRACED:FD-SEC-003 — @Public() decorator to exempt routes from auth
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
