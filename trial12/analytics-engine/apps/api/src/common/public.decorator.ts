import { SetMetadata } from '@nestjs/common';

// TRACED: AE-SEC-002
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
