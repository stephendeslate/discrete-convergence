"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatLogEntry = formatLogEntry;
function formatLogEntry(level, message, correlationId, context) {
    return {
        timestamp: new Date().toISOString(),
        level,
        message,
        correlationId,
        context,
    };
}
