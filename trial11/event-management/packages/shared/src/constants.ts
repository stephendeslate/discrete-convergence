// TRACED: EM-SHARED-001
export const APP_VERSION = '1.0.0';

// TRACED: EM-AUTH-001
export const BCRYPT_SALT_ROUNDS = 12;

// TRACED: EM-PERF-001
export const MAX_PAGE_SIZE = 100;

// TRACED: EM-PERF-002
export const DEFAULT_PAGE_SIZE = 20;

// TRACED: EM-AUTH-002
export const ALLOWED_REGISTRATION_ROLES = ['USER', 'ORGANIZER'] as const;

// TRACED: EM-SEC-001
export const JWT_EXPIRATION = '1h';

// TRACED: EM-API-001
export const API_ROUTES = {
  AUTH: '/auth',
  EVENTS: '/events',
  VENUES: '/venues',
  TICKETS: '/tickets',
  SCHEDULES: '/schedules',
  ATTENDEES: '/attendees',
  HEALTH: '/health',
  METRICS: '/metrics',
  MONITORING: '/monitoring',
} as const;

export type UserRole = 'ADMIN' | 'USER' | 'ORGANIZER';
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
export type TicketStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'CANCELLED';
