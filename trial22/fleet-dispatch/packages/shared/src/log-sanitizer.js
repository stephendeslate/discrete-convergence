"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeLogContext = sanitizeLogContext;
const SENSITIVE_KEYS = [
    'password',
    'passwordhash',
    'token',
    'accesstoken',
    'access_token',
    'refreshtoken',
    'refresh_token',
    'secret',
    'authorization',
    'cookie',
    'apikey',
    'api_key',
];
function sanitizeLogContext(obj) {
    if (obj === null || obj === undefined) {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map((item) => sanitizeLogContext(item));
    }
    if (typeof obj === 'object') {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
                result[key] = '[REDACTED]';
            }
            else {
                result[key] = sanitizeLogContext(value);
            }
        }
        return result;
    }
    return obj;
}
