// TRACED: EM-AUTH-005 — Public decorator for exempting routes from JWT auth
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
