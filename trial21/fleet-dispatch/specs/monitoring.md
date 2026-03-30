# Monitoring Specification

## Overview
Fleet Dispatch implements comprehensive monitoring with structured logging,
request tracing, response time tracking, and application metrics.

## Structured Logging
- Pino logger for all services — VERIFY: FD-MON-002
- JSON format for log aggregation
- Log context sanitization for sensitive data — VERIFY: FD-SEC-002
- formatLogEntry helper from shared package

## Request Tracing
- CorrelationIdMiddleware on all routes — VERIFY: FD-MON-004
- Creates UUID correlation ID per request
- Preserves existing X-Correlation-Id header
- Response includes X-Correlation-Id header

## Response Time Tracking
- ResponseTimeInterceptor as APP_INTERCEPTOR — VERIFY: FD-MON-003
- Sets X-Response-Time header on all responses
- Logs request duration with method, URL, status code

## Application Metrics
- GET /metrics endpoint — VERIFY: FD-MON-005
- Returns entity counts (work orders, technicians, customers, invoices)
- Timestamped for monitoring dashboards

## Health Probes
- GET /health — Liveness (always returns ok)
- GET /health/ready — Readiness (checks DB connectivity)
- Both endpoints are @Public() (no auth required)

## Uptime Monitoring
- GET /monitoring — App status with version and uptime — VERIFY: FD-MON-007
- @Public() for external uptime checkers

## Correlation ID Flow
1. Request arrives at middleware
2. If X-Correlation-Id header exists, use it
3. Otherwise, generate new UUID via createCorrelationId — VERIFY: FD-MON-001
4. Attach to request and response headers
5. Include in all log entries for the request

## Throttle Monitoring
- Three throttle tiers for traffic management
- Short: 100 req/1s, Medium: 500 req/10s, Long: 2000 req/60s
- Auth endpoints: 10 req/1s

## Edge Case Monitoring
- VERIFY: FD-EDGE-006 — GPS batch insert failures logged
- VERIFY: FD-EDGE-007 — Invoice state machine violations logged
- VERIFY: FD-EDGE-008 — Expired tracking token access logged
- VERIFY: FD-EDGE-009 — Cross-tenant access attempts logged
- VERIFY: FD-EDGE-010 — Database connectivity loss detected via health/ready

## Cross-References
- See [infrastructure.md](infrastructure.md) for deployment setup
- See [security.md](security.md) for log sanitization
- See [api-endpoints.md](api-endpoints.md) for endpoint details
