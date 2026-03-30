export declare const BCRYPT_SALT_ROUNDS = 12;
export declare const ALLOWED_REGISTRATION_ROLES: readonly ["USER", "DISPATCHER"];
export declare const MAX_PAGE_SIZE = 100;
export declare const DEFAULT_PAGE_SIZE = 20;
export declare const APP_VERSION = "1.0.0";
export declare function clampPagination(page?: number, pageSize?: number): {
    skip: number;
    take: number;
    page: number;
    pageSize: number;
};
export declare function createCorrelationId(): string;
export declare function formatLogEntry(data: {
    method: string;
    url: string;
    statusCode: number;
    duration: number;
    correlationId?: string;
}): string;
export declare function sanitizeLogContext(obj: unknown): unknown;
export declare function validateEnvVars(required: string[]): void;
