import { SetMetadata } from '@nestjs/common';

// TRACED: FD-SEC-005
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
