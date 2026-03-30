import { SetMetadata } from '@nestjs/common';

// TRACED:EM-SEC-001
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
