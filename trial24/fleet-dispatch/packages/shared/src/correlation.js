"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CORRELATION_ID_HEADER = void 0;
exports.createCorrelationId = createCorrelationId;
// TRACED:SHARED-CORRELATION
const node_crypto_1 = require("node:crypto");
exports.CORRELATION_ID_HEADER = 'x-correlation-id';
function createCorrelationId() {
    return (0, node_crypto_1.randomUUID)();
}
