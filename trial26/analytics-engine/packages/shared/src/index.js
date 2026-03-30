"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnvVars = exports.getCorrelationId = exports.sanitizeLogData = exports.SYNC_FAILURE_THRESHOLD = exports.MAX_WIDGETS_PER_DASHBOARD = exports.CORRELATION_HEADER = exports.JWT_EXPIRY = exports.DEFAULT_PAGE_SIZE = exports.MAX_PAGE_SIZE = exports.BCRYPT_SALT_ROUNDS = exports.APP_VERSION = void 0;
exports.APP_VERSION = '1.0.0';
exports.BCRYPT_SALT_ROUNDS = 12;
exports.MAX_PAGE_SIZE = 100;
exports.DEFAULT_PAGE_SIZE = 20;
exports.JWT_EXPIRY = '24h';
exports.CORRELATION_HEADER = 'x-correlation-id';
exports.MAX_WIDGETS_PER_DASHBOARD = 20;
exports.SYNC_FAILURE_THRESHOLD = 5;
var log_sanitizer_1 = require("./log-sanitizer");
Object.defineProperty(exports, "sanitizeLogData", { enumerable: true, get: function () { return log_sanitizer_1.sanitizeLogData; } });
var correlation_1 = require("./correlation");
Object.defineProperty(exports, "getCorrelationId", { enumerable: true, get: function () { return correlation_1.getCorrelationId; } });
var env_validation_1 = require("./env-validation");
Object.defineProperty(exports, "validateEnvVars", { enumerable: true, get: function () { return env_validation_1.validateEnvVars; } });
//# sourceMappingURL=index.js.map