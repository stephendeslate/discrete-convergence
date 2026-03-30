"use strict";
// TRACED:AE-LOG-001 — Log sanitizer for sensitive fields
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeLogContext = sanitizeLogContext;
const SENSITIVE_KEYS = new Set([
    'authorization',
    'cookie',
    'password',
    'token',
    'secret',
    'accessToken',
    'refreshToken',
]);
function sanitizeLogContext(obj) {
    if (obj === null || obj === undefined) {
        return obj;
    }
    if (typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map((item) => sanitizeLogContext(item));
    }
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        if (SENSITIVE_KEYS.has(key.toLowerCase())) {
            sanitized[key] = '[REDACTED]';
        }
        else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeLogContext(value);
        }
        else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}
