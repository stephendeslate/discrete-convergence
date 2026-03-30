// TRACED:EM-SEC-001
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/** Mark a controller or route as fully public — bypasses auth and tenant scoping */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
