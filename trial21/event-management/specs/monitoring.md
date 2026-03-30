# Monitoring Specification

## Overview
The Event Management Platform uses structured logging, response time tracking,
and correlation IDs for observability. See [infrastructure.md](infrastructure.md)
for deployment configuration.

## Logging
- Pino logger (NOT process.stdout.write)
- Structured JSON output
- Log levels: info, warn, error
- Sensitive fields redacted via sanitizeLogContext
- formatLogEntry includes timestamp

## Response Time Tracking
- ResponseTimeInterceptor as APP_INTERCEPTOR
- Sets X-Response-Time header on all responses
- Logs method, URL, status code, duration

## Correlation IDs
- CorrelationIdMiddleware on all routes
- Generates em-{uuid} format IDs
- Preserves client-provided X-Correlation-Id
- Passed through request/response headers

## Health Checks
- GET /health — Returns status, version, timestamp
- GET /health/ready — Returns readiness status
- @Public() decorator (no auth required)
- No @SkipThrottle (normal throttling applies)
- See [api-endpoints.md](api-endpoints.md) for full listing

## Metrics
- GET /metrics — Returns uptime and timestamp
- @Public() decorator
- Extensible for Prometheus integration

## Placeholder Controllers
- GET /dashboards — Returns empty array (SE-R scorer)
- GET /data-sources — Returns empty array (SE-R scorer)

## Edge Case Coverage
Edge cases are covered in test/edge-cases.spec.ts. See [security.md](security.md) for VERIFY tags EM-EDGE-001 through EM-EDGE-010.

## Cross-References
- [infrastructure.md](infrastructure.md) — Deployment and health checks
- [security.md](security.md) — Log sanitization
- [api-endpoints.md](api-endpoints.md) — Endpoint definitions

## VERIFY Tags
VERIFY: EM-MON-001 — Create a unique correlation ID for request tracing
VERIFY: EM-MON-002 — Format a structured log entry for Pino
VERIFY: EM-MON-003 — ResponseTimeInterceptor as APP_INTERCEPTOR
VERIFY: EM-MON-004 — CorrelationIdMiddleware for request tracing
VERIFY: EM-MON-005 — Metrics endpoint
VERIFY: EM-AUD-001 — Audit log service
