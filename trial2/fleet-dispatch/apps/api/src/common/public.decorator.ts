import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark a route as public — bypasses JwtAuthGuard.
 * TRACED:FD-SEC-001
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
