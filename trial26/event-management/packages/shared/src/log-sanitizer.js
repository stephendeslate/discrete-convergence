"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeLogContext = sanitizeLogContext;
function sanitizeLogContext(context) {
    const sensitiveKeys = ['password', 'passwordHash', 'token', 'authorization', 'cookie', 'secret'];
    const sanitized = {};
    for (const [key, value] of Object.entries(context)) {
        if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
            sanitized[key] = '[REDACTED]';
        }
        else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}
//# sourceMappingURL=log-sanitizer.js.map