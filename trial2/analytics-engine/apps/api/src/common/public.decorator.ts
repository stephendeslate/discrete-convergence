import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as public, exempting it from JWT authentication.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
