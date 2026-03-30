// TRACED:EM-AUTH-001 — bcrypt cost factor shared across API and seed
export const BCRYPT_SALT_ROUNDS = 12;

// TRACED:EM-AUTH-002 — role whitelist prevents ADMIN self-registration
export const ALLOWED_REGISTRATION_ROLES = ['ORGANIZER', 'ATTENDEE'] as const;

// TRACED:EM-CROSS-001 — version string used in /health and CLAUDE.md
export const APP_VERSION = '1.0.0';

// Internal constants used by clampPagination — not re-exported
const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;

// TRACED:EM-PERF-001 — pagination clamping (not rejection) for list endpoints
export function clampPagination(page?: number, pageSize?: number): { skip: number; take: number } {
  const validPage = Math.max(1, Math.floor(Number(page) || 1));
  const validSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(Number(pageSize) || DEFAULT_PAGE_SIZE)));
  return { skip: (validPage - 1) * validSize, take: validSize };
}
