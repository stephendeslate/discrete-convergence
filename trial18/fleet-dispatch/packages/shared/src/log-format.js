"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatLogEntry = formatLogEntry;
function formatLogEntry(entry) {
    return {
        timestamp: new Date().toISOString(),
        level: entry.level ?? 'info',
        message: entry.message ?? '',
        correlationId: entry.correlationId,
        method: entry.method,
        url: entry.url,
        statusCode: entry.statusCode,
        duration: entry.duration,
        userId: entry.userId,
        tenantId: entry.tenantId,
    };
}
//# sourceMappingURL=log-format.js.map