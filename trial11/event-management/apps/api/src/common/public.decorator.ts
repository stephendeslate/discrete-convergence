import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

// TRACED: EM-SEC-003
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
