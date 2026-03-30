"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCorrelationId = createCorrelationId;
const crypto_1 = require("crypto");
function createCorrelationId() {
    return (0, crypto_1.randomUUID)();
}
