"use strict";
// TRACED:AE-ENV-001 — Environment variable validation
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnvVars = validateEnvVars;
function validateEnvVars(keys) {
    const missing = [];
    for (const key of keys) {
        if (!process.env[key]) {
            missing.push(key);
        }
    }
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}
