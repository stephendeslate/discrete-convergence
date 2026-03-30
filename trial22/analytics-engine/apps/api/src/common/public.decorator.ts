import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
// TRACED: AE-SEC-002
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
