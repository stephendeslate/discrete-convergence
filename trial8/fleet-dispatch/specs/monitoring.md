# Monitoring Specification

## Overview
Structured logging with Pino, correlation ID tracking, request logging,
health endpoints, and global exception handling.

## Logging
- Pino logger injected via DI (LoggerService)
- No console.log in api/src/ code
- Structured JSON format

## Correlation ID
- CorrelationIdMiddleware preserves existing or generates new via createCorrelationId
- Set on request headers and response headers (x-correlation-id)
- RequestContextService (request-scoped) stores correlation ID per request

## Request Logging
- RequestLoggingMiddleware logs on response finish
- Uses formatLogEntry from shared package
- Includes method, url, statusCode, duration, correlationId

## Health Endpoints
- GET /health - @Public() + @SkipThrottle()
  - Returns: status, timestamp, uptime, APP_VERSION from shared
- GET /health/ready - @Public() + @SkipThrottle()
  - Runs $queryRaw to verify database connectivity
  - Returns: status, timestamp
- GET /metrics - @Public() + @SkipThrottle()
  - Returns: uptime, memoryUsage, timestamp
- VERIFY: FD-MON-001 - Health endpoint returns status ok
- VERIFY: FD-MON-002 - Ready endpoint returns status ready
- VERIFY: FD-MON-003 - Metrics endpoint returns uptime and memory
- VERIFY: FD-MON-004 - Frontend error reports accepted

## Global Exception Filter
- Registered as APP_FILTER
- Catches all exceptions
- Returns sanitized error response with correlationId
- Logs error with sanitizeLogContext from shared
- HTTP exceptions preserve original status code
- Non-HTTP exceptions return 500

## Sanitize Log Context
- Redacts sensitive fields: password, passwordHash, token, accessToken, secret, authorization
- Supports deep nested objects
- Supports arrays
- VERIFY: FD-MON-005 - sanitizeLogContext redacts password
- VERIFY: FD-MON-006 - sanitizeLogContext redacts nested fields
- VERIFY: FD-MON-007 - sanitizeLogContext redacts in arrays
- VERIFY: FD-MON-008 - sanitizeLogContext handles null and primitives

## Response Time
- ResponseTimeInterceptor as APP_INTERCEPTOR
- Adds X-Response-Time header to all responses
- Uses performance.now() for accurate timing
- VERIFY: FD-PERF-001 - X-Response-Time header present

## Frontend Error Boundary
- ErrorBoundaryReporter component reports errors to POST /errors

## Cross-References
- See [security.md](security.md) for sanitization details
- See [infrastructure.md](infrastructure.md) for health check configuration
