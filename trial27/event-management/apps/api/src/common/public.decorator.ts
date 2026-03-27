// TRACED: EM-AUTH-003 — Public route decorator to bypass JWT guard
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
