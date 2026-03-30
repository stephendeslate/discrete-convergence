"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeLogData = sanitizeLogData;
const SENSITIVE_KEYS = ['password', 'token', 'secret', 'authorization', 'cookie', 'configEncrypted'];
function sanitizeLogData(data) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
        if (SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s))) {
            sanitized[key] = '[REDACTED]';
        }
        else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            sanitized[key] = sanitizeLogData(value);
        }
        else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}
//# sourceMappingURL=log-sanitizer.js.map