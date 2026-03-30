// TRACED:EM-AUTH-005 — @Public() decorator with SetMetadata for route-level auth bypass
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
