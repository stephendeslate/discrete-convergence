export const BCRYPT_SALT_ROUNDS = 12;

export const ALLOWED_REGISTRATION_ROLES = ['EDITOR', 'VIEWER'] as const;

export const APP_VERSION = '1.0.0';

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;

export function clampPagination(page?: number, limit?: number): { page: number; limit: number } {
  const clampedPage = Math.max(1, Math.floor(page ?? 1));
  const clampedLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(limit ?? DEFAULT_PAGE_SIZE)));
  return { page: clampedPage, limit: clampedLimit };
}
