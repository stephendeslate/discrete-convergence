import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

// TRACED:FD-CL-002 — @Public() decorator for auth/health exemption
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
