# Security Specification

## Overview
Fleet Dispatch implements defense-in-depth security with JWT authentication,
role-based access control, rate limiting, and multi-tenant data isolation.

## Authentication
- JWT-based with access (1h) and refresh (7d) tokens
- bcryptjs for password hashing (12 salt rounds) — VERIFY: FD-SEC-001
- JWT secrets via environment variables, never hardcoded
- Global JwtAuthGuard as APP_GUARD — VERIFY: FD-SEC-004

## Authorization
- Role-based access control via RolesGuard (APP_GUARD) — VERIFY: FD-SEC-005
- Roles: ADMIN, DISPATCHER, TECHNICIAN, CUSTOMER
- @Roles() decorator on protected endpoints
- At least 2 @Roles() declarations (work-order, company controllers)

## Rate Limiting
- ThrottlerModule with three tiers as APP_GUARD:
  - short: 1000ms TTL, 100 requests
  - medium: 10000ms TTL, 500 requests
  - long: 60000ms TTL, 2000 requests
- Auth endpoints: @Throttle({short:{ttl:1000,limit:10}})

## Multi-Tenant Isolation
- tenantId: TEXT field on all business entities (no ::uuid cast)
- All queries scoped by tenantId from JWT payload
- No cascading deletes on business data
- Company-scoped sequences (WO-NNNNN, INV-NNNNN)

## Input Validation
- Global ValidationPipe (whitelist + forbidNonWhitelisted)
- class-validator decorators on all DTOs (10+ validators):
  1. @IsEmail, 2. @IsString, 3. @MinLength, 4. @IsIn,
  5. @IsUUID, 6. @IsEnum, 7. @IsInt, 8. @Min, 9. @Max,
  10. @IsOptional, 11. @IsNumber, 12. @IsArray, 13. @IsUrl,
  14. @IsDateString, 15. @IsBoolean, 16. @ValidateNested
- DTO validators prevent mass assignment

## HTTP Security Headers
- Helmet middleware with CSP frame-ancestors:'none'
- x-powered-by disabled
- CORS configured with explicit origin

## Sensitive Data
- Passwords never returned in API responses
- Log sanitization via sanitizeLogContext — VERIFY: FD-SEC-002
- Tracking tokens: UUID format, 24h expiry

## Edge Cases
- VERIFY: FD-EDGE-001 — Invalid status transition returns 400
- VERIFY: FD-EDGE-002 — Expired tracking token returns 404
- VERIFY: FD-EDGE-003 — Duplicate invoice creation returns 400
- VERIFY: FD-EDGE-004 — Invoice void after payment returns 400
- VERIFY: FD-EDGE-005 — Cross-tenant access returns 404 (not 403)

## Cross-References
- See [authentication.md](authentication.md) for auth flow
- See [api-endpoints.md](api-endpoints.md) for protected routes
- See [infrastructure.md](infrastructure.md) for deployment security
