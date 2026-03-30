// TRACED:FD-COMMON-009 — Public decorator to mark endpoints as fully-public
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
