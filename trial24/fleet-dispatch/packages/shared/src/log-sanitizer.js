"use strict";
// TRACED:SHARED-LOG-SANITIZER
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeLogContext = sanitizeLogContext;
const SENSITIVE_KEYS = new Set([
    'password',
    'passwordHash',
    'token',
    'accessToken',
    'refreshToken',
    'secret',
    'authorization',
    'cookie',
]);
function sanitizeLogContext(obj) {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (SENSITIVE_KEYS.has(key.toLowerCase())) {
            sanitized[key] = '[REDACTED]';
        }
        else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            sanitized[key] = sanitizeLogContext(value);
        }
        else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}
