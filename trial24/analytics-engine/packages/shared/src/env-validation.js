"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnvVars = validateEnvVars;
function validateEnvVars(required) {
    const missing = required.filter((key) => {
        const val = process.env[key];
        return val === undefined || val === '';
    });
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}
//# sourceMappingURL=env-validation.js.map