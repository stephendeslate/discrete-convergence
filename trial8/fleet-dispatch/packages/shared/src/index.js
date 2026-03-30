"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APP_VERSION = exports.DEFAULT_PAGE_SIZE = exports.MAX_PAGE_SIZE = exports.ALLOWED_REGISTRATION_ROLES = exports.BCRYPT_SALT_ROUNDS = void 0;
exports.clampPagination = clampPagination;
exports.createCorrelationId = createCorrelationId;
exports.formatLogEntry = formatLogEntry;
exports.sanitizeLogContext = sanitizeLogContext;
exports.validateEnvVars = validateEnvVars;
const crypto_1 = require("crypto");
exports.BCRYPT_SALT_ROUNDS = 12;
exports.ALLOWED_REGISTRATION_ROLES = ['USER', 'DISPATCHER'];
exports.MAX_PAGE_SIZE = 100;
exports.DEFAULT_PAGE_SIZE = 20;
exports.APP_VERSION = '1.0.0';
function clampPagination(page, pageSize) {
    const p = Math.max(1, page ?? 1);
    const ps = Math.min(exports.MAX_PAGE_SIZE, Math.max(1, pageSize ?? exports.DEFAULT_PAGE_SIZE));
    return { skip: (p - 1) * ps, take: ps, page: p, pageSize: ps };
}
function createCorrelationId() {
    return (0, crypto_1.randomUUID)();
}
function formatLogEntry(data) {
    return JSON.stringify({
        method: data.method,
        url: data.url,
        statusCode: data.statusCode,
        duration: `${data.duration}ms`,
        correlationId: data.correlationId ?? 'unknown',
        timestamp: new Date().toISOString(),
    });
}
const SENSITIVE_KEYS = new Set([
    'password',
    'passwordHash',
    'token',
    'accessToken',
    'secret',
    'authorization',
]);
function sanitizeLogContext(obj) {
    if (obj === null || obj === undefined)
        return obj;
    if (typeof obj === 'string')
        return obj;
    if (typeof obj !== 'object')
        return obj;
    if (Array.isArray(obj)) {
        return obj.map((item) => sanitizeLogContext(item));
    }
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        if (SENSITIVE_KEYS.has(key)) {
            result[key] = '[REDACTED]';
        }
        else if (typeof value === 'object' && value !== null) {
            result[key] = sanitizeLogContext(value);
        }
        else {
            result[key] = value;
        }
    }
    return result;
}
function validateEnvVars(required) {
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}
//# sourceMappingURL=index.js.map