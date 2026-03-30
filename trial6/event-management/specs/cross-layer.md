# Cross-Layer Specification

## VERIFY:EM-CROSS-001 — Monorepo Structure
pnpm workspaces with Turborepo. apps/api, apps/web, packages/shared.

## VERIFY:EM-CROSS-002 — Shared Package
@event-management/shared exports constants, utilities, and types consumed by both API and web.
Uses workspace:* protocol for local resolution.

## VERIFY:EM-CROSS-003 — App Version
APP_VERSION constant from shared package used in health endpoint.

## VERIFY:EM-CROSS-004 — Global Exception Filter
GlobalExceptionFilter catches all exceptions, sanitizes error responses,
includes correlationId, logs with Pino.

## VERIFY:EM-PERF-001 — Pagination Clamping
clampPagination() clamps (not rejects) page and pageSize values.
MAX_PAGE_SIZE=100, DEFAULT_PAGE_SIZE=20.

## VERIFY:EM-PERF-002 — Response Time Tracking
ResponseTimeInterceptor measures request duration using perf_hooks
and sets X-Response-Time header.

## VERIFY:EM-PERF-003 — Pagination Response
buildPaginatedResult() constructs response with data array and meta
(total, page, pageSize, totalPages).

## Integration Patterns

- Controllers extract tenantId from JWT user
- Services validate tenant ownership before data access
- Shared package provides constants consumed by multiple apps
- Middleware chain: CorrelationId -> RequestLogging -> Route Handler
- Global providers: JwtAuthGuard -> RolesGuard -> ThrottlerGuard

## Error Handling

- HttpException for known errors (400, 401, 403, 404, 409)
- GlobalExceptionFilter for unhandled exceptions (500)
- Sanitized error responses (no stack traces in production)
- CorrelationId included in error responses for tracing
