/** Application version — used in health endpoint and CLAUDE.md */
export const APP_VERSION = '1.0.0';

/** bcrypt salt rounds for password hashing — imported by auth service and seed */
export const BCRYPT_SALT_ROUNDS = 12;

/** Maximum items per page — clamp (not reject) requests above this */
export const MAX_PAGE_SIZE = 100;

/** Default items per page when not specified */
export const DEFAULT_PAGE_SIZE = 20;

/** Roles allowed during self-registration — ADMIN excluded */
export const ALLOWED_REGISTRATION_ROLES = ['VIEWER', 'DISPATCHER'] as const;

/** All roles in the system */
export const ALL_ROLES = ['ADMIN', 'VIEWER', 'DISPATCHER'] as const;

/** Vehicle statuses */
export const VEHICLE_STATUSES = ['ACTIVE', 'MAINTENANCE', 'RETIRED'] as const;

/** Driver statuses */
export const DRIVER_STATUSES = ['AVAILABLE', 'ON_DUTY', 'OFF_DUTY'] as const;

/** Dispatch statuses */
export const DISPATCH_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
