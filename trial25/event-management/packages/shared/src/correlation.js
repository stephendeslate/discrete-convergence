"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CORRELATION_ID_HEADER = void 0;
exports.createCorrelationId = createCorrelationId;
const crypto_1 = require("crypto");
exports.CORRELATION_ID_HEADER = 'x-correlation-id';
function createCorrelationId() {
    return (0, crypto_1.randomUUID)();
}
//# sourceMappingURL=correlation.js.map