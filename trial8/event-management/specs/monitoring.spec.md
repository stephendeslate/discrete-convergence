# Monitoring Spec

## EM-MON-001 — App Version
- **TRACED**: `packages/shared/src/index.ts` — APP_VERSION = '1.0.0'

## EM-MON-002 — Correlation ID Generator
- **TRACED**: `packages/shared/src/index.ts` — createCorrelationId() uses randomUUID

## EM-MON-003 — Structured Log Entry Formatter
- **TRACED**: `packages/shared/src/index.ts` — formatLogEntry()
- Returns structured object with method, url, statusCode, duration, correlationId, timestamp.

## EM-MON-004 — Request Context Service
- **TRACED**: `apps/api/src/monitoring/request-context.service.ts`
- Uses AsyncLocalStorage for per-request context propagation.

## EM-MON-005 — Correlation ID Middleware
- **TRACED**: `apps/api/src/monitoring/correlation-id.middleware.ts`
- **VERIFY**: `test/security.spec.ts` — Correlation ID returned in response headers
- **VERIFY**: `test/security.spec.ts` — Custom correlation ID is echoed back
- Generates UUID if not provided; echoes x-correlation-id header.

## EM-MON-006 — Request Logging Middleware
- **TRACED**: `apps/api/src/monitoring/request-logging.middleware.ts`
- Logs structured entry on response finish with duration and correlation ID.

## Verification Tags
- VERIFY: EM-MON-001
- VERIFY: EM-MON-002
- VERIFY: EM-MON-003
- VERIFY: EM-MON-004
- VERIFY: EM-MON-005
- VERIFY: EM-MON-006
