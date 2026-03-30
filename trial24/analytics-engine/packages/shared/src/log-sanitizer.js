"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeLogContext = sanitizeLogContext;
const SENSITIVE_KEYS = [
    'password',
    'passwordHash',
    'token',
    'secret',
    'authorization',
    'cookie',
    'creditCard',
    'ssn',
    'connectionString',
];
function sanitizeLogContext(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        if (SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k.toLowerCase()))) {
            result[key] = '[REDACTED]';
        }
        else if (Array.isArray(value)) {
            result[key] = value.map((item) => typeof item === 'object' && item !== null
                ? sanitizeLogContext(item)
                : item);
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
//# sourceMappingURL=log-sanitizer.js.map