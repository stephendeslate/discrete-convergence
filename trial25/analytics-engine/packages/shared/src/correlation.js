"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCorrelationId = createCorrelationId;
// TRACED:SHARED-CORR — Correlation ID utilities
const crypto_1 = require("crypto");
// TRACED:AE-CORR-001 — Correlation ID generation
function createCorrelationId() {
    return (0, crypto_1.randomUUID)();
}
