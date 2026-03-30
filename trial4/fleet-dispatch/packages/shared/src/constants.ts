/** Application version — used in health endpoint and CLAUDE.md */
export const APP_VERSION = '0.1.0';

/** Bcrypt salt rounds for password hashing */
export const BCRYPT_SALT_ROUNDS = 12;

/** Roles users may self-register as (ADMIN excluded) */
export const ALLOWED_REGISTRATION_ROLES = ['DISPATCHER', 'TECHNICIAN', 'CUSTOMER'] as const;

/** Maximum items per page for paginated queries */
export const MAX_PAGE_SIZE = 100;

/** Default items per page when not specified */
export const DEFAULT_PAGE_SIZE = 20;

/** Work order status values */
export const WORK_ORDER_STATUSES = [
  'UNASSIGNED',
  'ASSIGNED',
  'EN_ROUTE',
  'ON_SITE',
  'IN_PROGRESS',
  'COMPLETED',
  'INVOICED',
  'PAID',
  'CANCELLED',
] as const;

/** Invoice status values */
export const INVOICE_STATUSES = ['DRAFT', 'SENT', 'PAID', 'VOID'] as const;

/** User role values */
export const USER_ROLES = ['ADMIN', 'DISPATCHER', 'TECHNICIAN', 'CUSTOMER'] as const;

/** Priority levels for work orders */
export const PRIORITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
