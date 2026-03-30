"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeLogContext = sanitizeLogContext;
const SENSITIVE_KEYS = [
    'password',
    'passwordhash',
    'token',
    'accesstoken',
    'secret',
    'authorization',
    'refreshtoken',
    'apikey',
];
function sanitizeLogContext(obj) {
    if (obj === null || obj === undefined) {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map((item) => sanitizeLogContext(item));
    }
    if (typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
                sanitized[key] = '[REDACTED]';
            }
            else {
                sanitized[key] = sanitizeLogContext(value);
            }
        }
        return sanitized;
    }
    return obj;
}
//# sourceMappingURL=log-sanitizer.js.map