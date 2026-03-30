"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCorrelationId = getCorrelationId;
const crypto_1 = require("crypto");
function getCorrelationId(headerValue) {
    if (headerValue && typeof headerValue === 'string' && headerValue.length > 0) {
        return headerValue;
    }
    return (0, crypto_1.randomUUID)();
}
//# sourceMappingURL=correlation.js.map