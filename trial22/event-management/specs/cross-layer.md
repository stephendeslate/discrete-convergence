# Cross-Layer Integration Specification

## Overview

This document describes how the authentication, authorization, data access,
and monitoring layers interact end-to-end.

## Request Lifecycle

1. Request arrives at Express/NestJS
2. CorrelationIdMiddleware assigns/preserves X-Correlation-ID
3. RequestLoggingMiddleware logs the incoming request via pino
4. ThrottlerGuard checks rate limits
5. JwtAuthGuard validates Bearer token (or skips for @Public routes)
6. RolesGuard checks @Roles metadata against JWT role
7. ValidationPipe validates and transforms request body/query
8. Controller delegates to Service
9. Service uses PrismaService with tenant-scoped queries
10. ResponseTimeInterceptor measures and sets X-Response-Time
11. GlobalExceptionFilter catches any unhandled errors

## Auth-to-Data Flow

The JWT payload contains tenantId from the authenticated user.
Controllers extract `req.user.tenantId` and pass it to services.
Services use tenantId in all Prisma WHERE clauses for multi-tenant isolation.

## Frontend-to-API Flow

1. User submits login form (client component)
2. LoginForm calls `login()` server action
3. Server action POSTs to `/auth/login`
4. On success, stores token via `cookies().set('token', ...)`
5. Subsequent server actions read `cookies().get('token')`
6. Server actions pass `Authorization: Bearer ${token}` to API
7. API validates token via JwtAuthGuard
8. On 401, server action redirects to `/login`

## Error Propagation

1. Service throws NestJS HttpException
2. GlobalExceptionFilter catches it
3. Filter logs error with sanitizeLogContext
4. Filter returns JSON with statusCode, message, timestamp, correlationId
5. Frontend server action checks response status
6. On error, re-throws for error.tsx to handle

## Multi-Tenant Data Isolation

- Application level: tenantId in WHERE clauses
- Database level: RLS policies check current_setting
- PrismaService.setTenantContext() sets database-level tenant context

## Testing Strategy

Cross-layer integration tests verify:
- Full request lifecycle from HTTP to database
- Auth token propagation through layers
- Tenant isolation across requests
- Error handling end-to-end

## Related Specs

See [authentication.md](authentication.md) for JWT details.
See [security.md](security.md) for guard configuration.
See [monitoring.md](monitoring.md) for logging pipeline.
See [data-model.md](data-model.md) for RLS configuration.
