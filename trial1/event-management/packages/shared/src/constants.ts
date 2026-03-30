export const BCRYPT_SALT_ROUNDS = 12;
export const ALLOWED_REGISTRATION_ROLES = ['ADMIN', 'ORGANIZER', 'ATTENDEE'] as const;
export const APP_VERSION = '1.0.0';

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;

export function clampPagination(page?: number, pageSize?: number): { skip: number; take: number } {
  const safePage = Math.max(1, Math.floor(Number(page) || 1));
  const safeSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(Number(pageSize) || DEFAULT_PAGE_SIZE)));
  return { skip: (safePage - 1) * safeSize, take: safeSize };
}
