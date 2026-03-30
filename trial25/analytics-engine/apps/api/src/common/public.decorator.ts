// TRACED:AUTH-PUBLIC-DECORATOR — Public route decorator
import { SetMetadata } from '@nestjs/common';

/**
 * Marks a route as publicly accessible (no auth required).
 * TRACED:AE-PUB-001 — Public decorator bypasses auth guards
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
